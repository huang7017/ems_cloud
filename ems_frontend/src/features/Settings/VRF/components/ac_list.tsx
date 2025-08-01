import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Typography,
  Snackbar,
  Alert,

  Box,
  IconButton,
  TextField,

  Stack
} from "@mui/material";
import {
  DataGridPro,
  type GridColDef,
  useGridApiRef,
} from "@mui/x-data-grid-pro";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../reducer";
import type { IState } from "../../../../store/reducers";
import { ioModuleSelector, vrfACSelector } from "../selector";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { vrfAC } from "../types";
import EditAC from "./edit_ac";

const ACList = ({
  open,
  lng,
  recordId,
  setOpen,
}: {
  open: boolean;
  lng: string;
  recordId: string | null;
  setOpen: (value: boolean) => void;
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: IState) => state.vrf);
  
  // 使用正确的方式获取 selector 结果
  const vrfACsRaw = useSelector(vrfACSelector);
  const ioModuleRaw = useSelector(ioModuleSelector);
  
  // 使用 useMemo 包装数据处理
  const vrfACs = useMemo(() => vrfACsRaw || [], [vrfACsRaw]);
  const ioModule = useMemo(() => ioModuleRaw || {}, [ioModuleRaw]);
  
  const apiRef = useGridApiRef();
  const [acId, setAcId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<vrfAC | null>(null);
  const [ioDialogOpen, setIoDialogOpen] = useState(false);
  const [channel, setChannel] = useState<string>("");
  
  // Check if any AC has ac_number equal to 0
  const isSetIODisabled = vrfACs.some(ac => ac.ac_number === 0);
  
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowError(true);
    }
  }, [error]);
  
  useEffect(() => {
    setSubmitting(loading);
  }, [loading]);
  
  useEffect(() => {
    if (open && recordId) {
      dispatch(actions.getVrfAC(recordId));
      dispatch(actions.setLoading(true));
    }
  }, [open, recordId, dispatch]);

  useEffect(() => {
    if (acId) {
      const ac = vrfACs.find(item => item.id === acId);
      if (ac && editOpen) {
        setEditData({ ...ac });
      }
    }
  }, [acId, vrfACs, editOpen]);
  
  useEffect(() => {
    if (vrfACs.length > 0) {
      dispatch(actions.setLoading(false));
    }
  }, [vrfACs, dispatch]);
  
  useEffect(() => {
    if (ioModule && ioModule.channel !== undefined) {
      setChannel(ioModule.channel.toString());
    }
  }, [ioModule]);
  
  const handleClose = () => {
    dispatch(actions.clearError());
    setShowError(false);
    setErrorMessage("");
    setOpen(false);
  };

  const handleErrorClose = () => {
    setShowError(false);
  };
  
  const handleDelete = () => {
    if (!acId) return;
    dispatch(actions.deleteVrfAC(acId));
    setDeleteOpen(false);
  };
  
  const handleSetIO = () => {
    setIoDialogOpen(true);
    dispatch(actions.getIoModule(recordId as string));
  };

  const handleIoDialogClose = () => {
    setIoDialogOpen(false);
    setChannel("");
  };

  const handleIoSubmit = () => {
    dispatch(actions.createIoModule({
      channel: parseInt(channel),
      vrf: recordId as string
    }));
    setIoDialogOpen(false);
    setChannel("");
  };
  

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "ac_name", headerName: "空調名稱", flex: 1 },
    { field: "ac_location", headerName: "空調位置", flex: 1 },
    { field: "ac_number", headerName: "空調編號", flex: 1 },
    { field: "temperature_sensor_id", headerName: "溫度感應器ID", flex: 1 },
    { field: "temperature_sensor_address", headerName: "溫度感應器地址", flex: 1 },
    {
      field: "actions",
      headerName: "",
      flex: 1,
      align: "center",
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <div>
          <IconButton size="small" style={{ margin: "5px" }} onClick={() => {
            setAcId(params.id as string);
            setEditOpen(true);
          }}>
            <EditIcon fontSize="inherit"  />
          </IconButton>
          <IconButton size="small" style={{ margin: "5px" }} onClick={() => {
            setAcId(params.id as string);
            setDeleteOpen(true);
          }}>
            <DeleteIcon fontSize="inherit"  />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <Dialog
        open={open}
        PaperProps={{
          component: "form",
          style: { width: "800px", height: "600px" },
        }}
        onClose={handleClose}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography>空調列表</Typography>
            <Button 
              variant="contained" 
              color="primary"
              disabled={isSetIODisabled}
              onClick={handleSetIO}
            >
              Set IO
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ height: "100%" }}>
          <Box height="calc(100% - 20px)" width="100%">
            <DataGridPro
              apiRef={apiRef}
              rows={vrfACs}
              columns={columns}
              loading={loading}
              disableRowSelectionOnClick
              showToolbar
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            關閉
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog
        open={deleteOpen}
        PaperProps={{
          component: "form",
          style: { width: "500px" },
        }}
        onClose={() => setDeleteOpen(false)}
      >
        <DialogTitle>刪除空調</DialogTitle>
        <DialogContent>
          <Typography>
            確定要刪除此空調嗎？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={submitting}>
            取消
          </Button>
          <Button 
            onClick={handleDelete} 
            disabled={submitting}
            variant="contained"
            color="error"
          >
            {submitting ? "處理中..." : "確認"}
          </Button>
        </DialogActions>
      </Dialog>
      
      <EditAC 
        open={editOpen}
        lng={lng}
        acData={editData}
        setOpen={setEditOpen}
      />
      
      {/* IO Channel Dialog */}
      <Dialog
        open={ioDialogOpen}
        PaperProps={{
          component: "form",
          style: { width: "500px" },
        }}
        onClose={handleIoDialogClose}
      >
        <DialogTitle>設置 IO 頻道</DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <TextField
              fullWidth
              type="number"
              label="頻道"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              variant="outlined"
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleIoDialogClose} disabled={submitting}>
            取消
          </Button>
          <Button 
            onClick={handleIoSubmit} 
            disabled={submitting || !channel.trim()}
            variant="contained"
            color="primary"
          >
            {submitting ? "處理中..." : "確認"}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleErrorClose} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ACList;
