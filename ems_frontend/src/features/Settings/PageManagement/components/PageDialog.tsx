import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../reducer";
import {
  selectedPageSelector,
  isDialogOpenSelector,
  parentPagesSelector,
  availableIconsSelector,
} from "../selector";

interface PageDialogProps {
  onClose: () => void;
  translate: (key: string, params?: Record<string, string | number>) => string;
}

const PageDialog: React.FC<PageDialogProps> = ({ onClose, translate }) => {
  const dispatch = useDispatch();
  const selectedPage = useSelector(selectedPageSelector);
  const isOpen = useSelector(isDialogOpenSelector);
  const parentPages = useSelector(parentPagesSelector);
  const availableIcons = useSelector(availableIconsSelector);

  const [formData, setFormData] = useState({
    parent: 0,
    title: "",
    url: "",
    icon: "HomeIcon",
    sort: 1,
    is_enable: true,
    is_show: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedPage) {
      setFormData({
        parent: selectedPage.parent,
        title: selectedPage.title,
        url: selectedPage.url,
        icon: selectedPage.icon,
        sort: selectedPage.sort || 1,
        is_enable: selectedPage.is_enable,
        is_show: selectedPage.is_show,
      });
    } else {
      setFormData({
        parent: 0,
        title: "",
        url: "",
        icon: "HomeIcon",
        sort: 1,
        is_enable: true,
        is_show: true,
      });
    }
    setErrors({});
  }, [selectedPage]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = translate("title_required");
    }

    if (!formData.url.trim()) {
      newErrors.url = translate("url_required");
    } else if (!formData.url.startsWith("/")) {
      newErrors.url = translate("url_must_start_with_slash");
    } else {
      // 驗證 URL 格式是否正確（支持動態參數如 :id）
      const urlPattern = /^\/[a-zA-Z0-9/\-_:]*$/;
      if (!urlPattern.test(formData.url)) {
        newErrors.url = translate("url_invalid_format");
      }
    }

    if (formData.sort < 1) {
      newErrors.sort = translate("order_must_be_positive");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (selectedPage) {
      dispatch(actions.updatePage({ ...selectedPage, ...formData }));
    } else {
      dispatch(actions.createPage(formData));
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {selectedPage ? translate("edit_page") : translate("add_page")}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>{translate("parent_page")}</InputLabel>
            <Select
              value={formData.parent}
              onChange={(e) =>
                setFormData({ ...formData, parent: e.target.value as number })
              }
              label={translate("parent_page")}
            >
              {parentPages.map((page) => (
                <MenuItem key={page.id} value={page.id}>
                  {page.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label={translate("title")}
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            error={!!errors.title}
            helperText={errors.title}
          />

          <TextField
            fullWidth
            label={translate("url")}
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            error={!!errors.url}
            helperText={errors.url || translate("url_help_text")}
            placeholder={translate("url_placeholder")}
          />

          <FormControl fullWidth>
            <InputLabel>{translate("icon")}</InputLabel>
            <Select
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              label={translate("icon")}
            >
              {availableIcons.map((icon) => (
                <MenuItem key={icon.value} value={icon.value}>
                  {icon.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="number"
            label={translate("order")}
            value={formData.sort}
            onChange={(e) =>
              setFormData({ ...formData, sort: parseInt(e.target.value) })
            }
            error={!!errors.sort}
            helperText={errors.sort}
            inputProps={{ min: 1 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_enable}
                onChange={(e) =>
                  setFormData({ ...formData, is_enable: e.target.checked })
                }
              />
            }
            label={translate("enable")}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_show}
                onChange={(e) =>
                  setFormData({ ...formData, is_show: e.target.checked })
                }
              />
            }
            label={translate("show")}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{translate("cancel")}</Button>
        <Button onClick={handleSubmit} variant="contained">
          {selectedPage ? translate("update") : translate("add_page")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PageDialog;
