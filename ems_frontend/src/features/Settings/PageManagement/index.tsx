"use client";
import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Pages as PagesIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "./reducer";
import {
  loadingSelector,
  errorSelector,
  searchTermSelector,
  selectedPageSelector,
} from "./selector";
import type { PageTreeItem } from "./types";
import { PageDialog, DeleteConfirmDialog, PageList } from "./components";
import { t } from "../../../helper/i18n";

interface PageProps {
  lng: string;
}

const PageManagementPage: React.FC<PageProps> = ({ lng }) => {
  const translate = (key: string, params?: Record<string, string | number>) =>
    t(key, lng, params);
  const dispatch = useDispatch();

  const loading = useSelector(loadingSelector);
  const error = useSelector(errorSelector);
  const searchTerm = useSelector(searchTermSelector);

  useEffect(() => {
    dispatch(actions.fetchPages());
  }, [dispatch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(actions.setSearchTerm(event.target.value));
  };

  const handleCreatePage = () => {
    dispatch(actions.setSelectedPage(null));
    dispatch(actions.setDialogOpen(true));
  };

  const handleEditPage = (page: PageTreeItem) => {
    dispatch(actions.setSelectedPage(page));
    dispatch(actions.setDialogOpen(true));
  };

  const handleDeletePage = (page: PageTreeItem) => {
    dispatch(actions.setSelectedPage(page));
    dispatch(actions.setDeleteDialogOpen(true));
  };

  const selectedPage = useSelector(selectedPageSelector);

  const handleConfirmDelete = () => {
    if (selectedPage) {
      dispatch(actions.deletePage(selectedPage.id));
    }
  };

  const handleCloseDialog = () => {
    dispatch(actions.setDialogOpen(false));
    dispatch(actions.setSelectedPage(null));
  };

  const handleCloseDeleteDialog = () => {
    dispatch(actions.setDeleteDialogOpen(false));
    dispatch(actions.setSelectedPage(null));
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        p: { xs: 1, sm: 2, md: 3 },
      }}
    >
      {/* Header with Search and Actions */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          {/* Title Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              minWidth: { sm: "auto" },
            }}
          >
            <PagesIcon sx={{ fontSize: 32, color: "primary.main" }} />
            <Box>
              <Typography variant="h5" component="h1">
                {translate("page_management")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {translate("manage_page_structure")}
              </Typography>
            </Box>
          </Box>

          {/* Spacer to push search to center */}
          <Box sx={{ flex: 1, display: { xs: "none", sm: "block" } }} />

          {/* Search Bar */}
          <TextField
            placeholder={translate("search_pages")}
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", sm: 250 },
              minWidth: { sm: 200 },
            }}
          />

          {/* Add Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreatePage}
            sx={{ minWidth: { xs: "100%", sm: "auto" } }}
          >
            {translate("add_page")}
          </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 4,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Page List */}
      {!loading && (
        <PageList
          onEdit={handleEditPage}
          onDelete={handleDeletePage}
          translate={translate}
        />
      )}

      {/* Dialogs */}
      <PageDialog onClose={handleCloseDialog} translate={translate} />
      <DeleteConfirmDialog
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        translate={translate}
      />
    </Box>
  );
};

export default PageManagementPage;
