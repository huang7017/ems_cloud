'use client';
import * as React from 'react';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import type { SidebarItem } from './data';

interface PopperComponentProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  items: SidebarItem[];
  handleClickUrl: (url: string) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  lng: string;
}

const PopperComponent: React.FC<PopperComponentProps> = ({ anchorEl, open, items, handleClickUrl, handleMouseEnter, handleMouseLeave }) => {

  return (
    <Popper open={open} anchorEl={anchorEl} placement="right-start" disablePortal container={document.body} style={{ zIndex: 1300 }}>
      <Paper 
        elevation={3} 
        style={{ maxWidth: '300px' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <List component="nav">
          {items.map((child) => (
            <ListItemButton key={child.title} onClick={() => handleClickUrl(child.url ?? "")}>
              <ListItemIcon>
                {child.icon}
              </ListItemIcon>
              <ListItemText primary={child.title} />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    </Popper>
  );
};

export default PopperComponent;
