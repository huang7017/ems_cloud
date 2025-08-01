"use client";
import React, { useEffect, useState } from "react";
import { Paper, Button, Box, IconButton } from "@mui/material";
import {
  DataGridPro,
  useGridApiRef,
  GridToolbar,
} from "@mui/x-data-grid-pro";
import type { GridColDef } from "@mui/x-data-grid-pro";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "./reducer";
import { vrfSystemsSelector } from "./selector";
import AcUnitIcon from '@mui/icons-material/AcUnit';
import DeleteIcon from "@mui/icons-material/Delete";
import ListIcon from '@mui/icons-material/List';
import Edit from "./components/edit";
import Delete from "./components/delete";
import GetAc from "./components/get_ac";
import Breadcrumb from '../../../lib/components/Shared/breadcrumb/Breadcrumb';
import ACList from "./components/ac_list";
interface MenuPageProps {
  lng: string;
}
const VRFSystemsPage: React.FC<MenuPageProps> = ({ lng }) => {
  const apiRef = useGridApiRef();
  const dispatch = useDispatch();
  const vrfSystems = useSelector(vrfSystemsSelector) || [];
  useEffect(() => {
    dispatch(actions.getVRFSystems());
  }, [dispatch]);


  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [getAcOpen, setGetAcOpen] = useState(false);
  const [acListOpen, setAcListOpen] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [model, setModel] = useState("create")


  const columns: GridColDef[] = [
    { field: "id", headerName: "id", flex: 1 },
    { field: "address", headerName: "address", flex: 1 },
    { field: "created_at", headerName: "created_at", flex: 1 },
    { field: "updated_at", headerName: "updated_at", flex: 1 },
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
            setRecordId(params.id as string);
            setGetAcOpen(true);
          }}>
            <AcUnitIcon fontSize="inherit" />
          </IconButton>
          <IconButton size="small" style={{ margin: "5px" }} onClick={() => {
            setRecordId(params.id as string);
            setAcListOpen(true);
          }}>
            <ListIcon fontSize="inherit" />
          </IconButton>
          <IconButton size="small" style={{ margin: "5px" }} onClick={() => {
            setDeleteOpen(true);
            setRecordId(params.id as string);
          }}>
            <DeleteIcon fontSize="inherit"  />
          </IconButton>
        </div>
      ),
    },
  ];

  const BCrumb = [
    {
      to: '/',
      title: 'home',
    },
    {
      title: 'vrf_systems',
    },
  ];
  
  return (
    <>
      <Breadcrumb title={'vrf_systems'} items={BCrumb}/>
      <Paper
        style={{
          padding: "16px",
          margin: "0 auto",
          height: `calc(100vh - 112px)`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box display="flex" justifyContent="flex-end" marginBottom="16px">
          <Button variant="contained" color="primary" onClick={
            ()=>{
              setModel("create");
              setOpen(true);
              setRecordId(null);
            }
          }>
            {'create'} 
          </Button>
        </Box>
        <Box minHeight={`calc(100vh - 194px)`}>
          <DataGridPro
            apiRef={apiRef}
            rows={vrfSystems}
            columns={columns}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
          />
        </Box>
      </Paper>
      <Edit open={open} lng={lng} model={model} setOpen={setOpen} />
      <Delete
        open={deleteOpen}
        lng={lng}
        setOpen={setDeleteOpen}
        recordId={recordId}
      />
      <GetAc
        open={getAcOpen}
        lng={lng}
        setOpen={setGetAcOpen}
        recordId={recordId}
      />
      <ACList
        open={acListOpen}
        lng={lng}
        setOpen={setAcListOpen}
        recordId={recordId}
      />
    </>
  );
};

export default VRFSystemsPage;
