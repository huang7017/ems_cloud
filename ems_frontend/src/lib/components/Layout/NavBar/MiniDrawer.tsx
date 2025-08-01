"use client";
import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import AppBarComponent from "./AppBarComponent";
import DrawerComponent from "./DrawerComponent";
import MenuItems from "./MenuItems";
import PopperComponent from "./PopperComponent";
import type { SidebarItem } from "./data";

interface Menu {
  [key: string]: boolean;
}

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  width: `calc(100vw - 240px)`,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `${theme.spacing(7)}px`,
  ...(open && {
    width: `calc(100vw - 240px)`,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const MiniDrawer = ({
  children,
  sideBar,
  lng,
}: {
  children: React.ReactNode;
  sideBar: SidebarItem[];
  lng: string;
}) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [menu, setMenu] = React.useState<Menu>({});
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [hoveredItem, setHoveredItem] = React.useState<SidebarItem | null>(
    null
  );
  const [popperOpen, setPopperOpen] = React.useState(false);
  const popperTimeout = React.useRef<number | null>(null);

  React.useEffect(() => {
    const findIndexOf = (str: string, cha: string, num: number) => {
      let x = str.indexOf(cha);
      for (let i = 0; num > 0 && x !== -1; i++) {
        x = str.indexOf(cha, x + 1);
        if (x === -1) break;
      }
      return x;
    };

    let defaultParent = window.location.pathname.substring(
      findIndexOf(window.location.pathname, "/", 1) + 1,
      findIndexOf(window.location.pathname, "/", 2)
    );
    let obj: { [key: string]: boolean } = {};
    obj[defaultParent] = true;
    setMenu(obj);
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
    setMenu((prevMenu) => {
      const newMenu: Menu = {};
      for (const key in prevMenu) {
        newMenu[key] = false;
      }
      return newMenu;
    });
  };

  const handleClick = (item: string) => {
    if (open) {
      setMenu((prevMenu) => ({ ...prevMenu, [item]: !prevMenu[item] }));
    }
  };

  const handleClickUrl = () => {
    setMenu({});
    // router.push(url ?? "/"); // Removed next/navigation
  };

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLElement>,
    item: SidebarItem
  ) => {
    if (!open && item.children) {
      if (popperTimeout.current) {
        clearTimeout(popperTimeout.current);
      }
      setAnchorEl(event.currentTarget);
      setHoveredItem(item);
      setPopperOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!open) {
      popperTimeout.current = window.setTimeout(() => {
        setPopperOpen(false);
        setAnchorEl(null);
        setHoveredItem(null);
      }, 200);
    }
  };

  const handlePopperMouseEnter = () => {
    if (popperTimeout.current) {
      clearTimeout(popperTimeout.current);
    }
    setPopperOpen(true);
  };

  const handlePopperMouseLeave = () => {
    popperTimeout.current = window.setTimeout(() => {
      setPopperOpen(false);
      setAnchorEl(null);
      setHoveredItem(null);
    }, 200);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBarComponent open={open} handleDrawerOpen={handleDrawerOpen} />
      <DrawerComponent
        open={open}
        handleDrawerClose={handleDrawerClose}
        themeDirection={theme.direction}
      >
        <MenuItems
          items={sideBar}
          menu={menu}
          handleClick={handleClick}
          handleClickUrl={handleClickUrl}
          drawerOpen={open}
          lng={lng}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </DrawerComponent>
      {/* <Box component="main" sx={{ flexGrow: 1, p: 3 }}> */}
      <Main open={open}>
        <DrawerHeader />
        {children}
      </Main>
      {/* </Box> */}
      {hoveredItem && (
        <PopperComponent
          anchorEl={anchorEl}
          open={popperOpen}
          items={hoveredItem.children ?? []}
          handleClickUrl={handleClickUrl}
          handleMouseEnter={handlePopperMouseEnter}
          handleMouseLeave={handlePopperMouseLeave}
          lng={lng}
        />
      )}
    </Box>
  );
};

export { MiniDrawer };
