import { useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDispatch, useSelector } from "react-redux";
import NavItem from "./NavItem";
import NavCollapse from "./NavCollapse";
import NavGroup from "./NavGroup/NavGroup";
import type { IState } from "../../../../../store/reducers";
import { actions } from "../../../../../store/Customizer/reducer";
import type { MenuitemsType } from "./types";

const SidebarItems = ({
  menuitems,
  lng,
}: {
  menuitems: MenuitemsType[];
  lng: string;
}) => {
  const location = useLocation();
  const pathname = location.pathname;
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf("/"));
  const customizer = useSelector((state: IState) => state.customizer);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const hideMenu: any = lgUp
    ? customizer.isCollapse && !customizer.isSidebarHover
    : "";
  const dispatch = useDispatch();

  return (
    <Box sx={{ px: hideMenu ? 0.5 : 1.5 }}>
      <List
        sx={{
          pt: 0,
          "& .MuiListItemButton-root": {
            transition: "all 0.2s ease-in-out",
          },
        }}
        className="sidebarNav"
      >
        {menuitems.map((item) => {
          // SubHeader
          if (item.subheader) {
            return (
              <NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />
            );
          }
          // If has children (submenu)
          if (item.children) {
            return (
              <NavCollapse
                lng={lng}
                menu={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id}
                onClick={() => dispatch(actions.toggleMobileSidebar())}
              />
            );
          }
          // Single item
          return (
            <NavItem
              item={item}
              key={item.id}
              pathDirect={pathDirect}
              hideMenu={hideMenu}
              lng={lng}
              onClick={() => dispatch(actions.toggleMobileSidebar())}
            />
          );
        })}
      </List>
    </Box>
  );
};

export default SidebarItems;
