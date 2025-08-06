import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  Typography,
  Box,
  Chip,
  Tooltip,
  Collapse,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DragIndicator as DragIndicatorIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Assessment as ReportIcon,
  Devices as DeviceIcon,
  Notifications as NotificationIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  List as ListIcon,
  Monitor as MonitorIcon,
  Pages as PagesIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { pagesTreeSelector } from "../selector";
import type { PageTreeItem } from "../types";

interface PageListProps {
  onEdit: (page: PageTreeItem) => void;
  onDelete: (page: PageTreeItem) => void;
  translate: (key: string, params?: Record<string, string | number>) => string;
}

const iconMap: Record<string, React.ComponentType> = {
  HomeIcon,
  SettingsIcon,
  PeopleIcon,
  DashboardIcon,
  AnalyticsIcon,
  ReportIcon,
  DeviceIcon,
  NotificationIcon,
  HelpIcon,
  InfoIcon,
  ListIcon,
  MonitorIcon,
  PagesIcon,
};

const PageList: React.FC<PageListProps> = ({ onEdit, onDelete, translate }) => {
  const pages = useSelector(pagesTreeSelector);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (itemId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent /> : <InfoIcon />;
  };

  const countTotalPages = (pages: PageTreeItem[]): number => {
    return pages.reduce((total, page) => {
      return total + 1 + countTotalPages(page.children);
    }, 0);
  };

  const renderPageItem = (page: PageTreeItem) => {
    const hasChildren = page.children.length > 0;
    const isExpanded = expandedItems.has(page.id);
    const IconComponent = getIconComponent(page.icon);

    return (
      <Box key={page.id}>
        <ListItem
          sx={{
            pl: page.level * 3 + 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <DragIndicatorIcon
            sx={{ mr: 1, color: "text.secondary", cursor: "grab" }}
          />
          <ListItemIcon sx={{ minWidth: 40 }}>{IconComponent}</ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body1">{page.title}</Typography>
                {!page.isActive && (
                  <Chip label="停用" size="small" color="error" />
                )}
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {page.url}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {translate("order_info", {
                    order: page.order || 0,
                    updatedAt: page.updatedAt || "",
                  })}
                </Typography>
              </Box>
            }
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {hasChildren && (
              <IconButton size="small" onClick={() => toggleExpanded(page.id)}>
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            <Tooltip title={translate("edit")}>
              <IconButton
                size="small"
                onClick={() => onEdit(page)}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={translate("delete")}>
              <IconButton
                size="small"
                onClick={() => onDelete(page)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {page.children.map((child) => renderPageItem(child))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Paper sx={{ mt: 2 }}>
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6">{translate("page_list")}</Typography>
        <Typography variant="body2" color="text.secondary">
          {translate("total_pages", { count: countTotalPages(pages) })}
        </Typography>
      </Box>
      <List sx={{ p: 0 }}>{pages.map((page) => renderPageItem(page))}</List>
    </Paper>
  );
};

export default PageList;
