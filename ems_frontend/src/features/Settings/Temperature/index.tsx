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
import { temperaturesSelector } from "./selector";
import DeleteIcon from "@mui/icons-material/Delete";
import Edit from "./components/edit";
import Delete from "./components/delete";
import Breadcrumb from '../../../lib/components/Shared/breadcrumb/Breadcrumb';

interface MenuPageProps {
  lng: string;
}
const MenuPage: React.FC<MenuPageProps> = ({ lng }) => {
  const apiRef = useGridApiRef();
  const dispatch = useDispatch();
  const temperatures = useSelector(temperaturesSelector);
  useEffect(() => {
    dispatch(actions.getTemperatures());
  }, [dispatch]);


  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
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
      title: 'temperature',
    },
  ];

  
  return (
    <>
      <Breadcrumb title={'temperature'} items={BCrumb}/>
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
            }
          }>
            {'create'}
          </Button>
        </Box>
        <Box minHeight={`calc(100vh - 194px)`}>
          <DataGridPro
            apiRef={apiRef}
            rows={temperatures}
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
    </>
  );
};

export default MenuPage;
