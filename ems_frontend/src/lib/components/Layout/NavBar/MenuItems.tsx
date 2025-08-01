'use client';
import * as React from 'react';
import { useEffect, useState } from 'react';
import List from '@mui/material/List';  
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import { FaAngleUp, FaAngleDown } from "react-icons/fa";
import type { SidebarItem } from './data';

interface MenuItemsProps {
  items: SidebarItem[];
  menu: { [key: string]: boolean };
  handleClick: (item: string) => void;
  handleClickUrl: (url: string) => void;
  drawerOpen: boolean;
  lng: string;
  onMouseEnter: (event: React.MouseEvent<HTMLElement>, item: SidebarItem) => void;
  onMouseLeave: () => void;
}

const MenuItems: React.FC<MenuItemsProps> = ({ items, menu, handleClick, handleClickUrl, drawerOpen, onMouseEnter, onMouseLeave }) => {
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const handleMenu = (items: SidebarItem[]) =>
    items.map((item) => (
      <div
        key={item.title}
        onMouseEnter={(e) => onMouseEnter(e, item)}
        onMouseLeave={onMouseLeave}
      >
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton
            selected={currentPath === item.url}
            onClick={() => {
              if (drawerOpen) {
                item.children ? handleClick(item.title) : handleClickUrl(item.url ?? "");
              } else {
                item.children && handleClick(item.title);
              }
            }}
            sx={{
              minHeight: 48,
              justifyContent: "initial",
              px: 2.5,
              pointerEvents: 'auto',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 3,
                justifyContent: "center",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.title} sx={{ opacity: drawerOpen ? 1 : 0 }} />
            {item.children && (menu[item.title] && drawerOpen ? <FaAngleUp /> : <FaAngleDown />)}
          </ListItemButton>
        </ListItem>
        {item.children && (
          <Collapse in={menu[item.title] && drawerOpen} timeout="auto" unmountOnExit>
            <List sx={{ pl: 4 }} component="div" disablePadding>
              {handleMenu(item.children)}
            </List>
          </Collapse>
        )}
      </div>
    ));

  return (
    <>
      {handleMenu(items)}
    </>
  );
};

export default MenuItems;
