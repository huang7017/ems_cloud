import React from "react";
import { Link } from "react-router-dom";

// mui imports
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import type { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled, useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import type { IState } from "../../../../../../store/reducers";

type NavGroup = {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: any;
  children?: NavGroup[];
  chip?: string;
  chipColor?: any;
  variant?: string | any;
  external?: boolean;
  level?: number;
  onClick?: React.MouseEvent<HTMLButtonElement, MouseEvent>;
};

interface ItemType {
  lng: string;
  item: NavGroup;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  hideMenu?: any;
  level?: number | any;
  pathDirect: string;
}

export default function NavItem({
  item,
  level,
  pathDirect,
  hideMenu,
  onClick,
}: ItemType) {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
  const customizer = useSelector((state: IState) => state.customizer);
  const theme = useTheme();

  // 直接使用 item.icon，而不是作为组件
  const itemIcon = item?.icon;

  const ListItemStyled = styled(ListItemButton)(() => ({
    whiteSpace: "nowrap",
    marginBottom: "2px",
    padding: "8px 10px",
    gap: "10px",
    borderRadius: `${customizer.borderRadius}px`,
    backgroundColor:
      pathDirect === item?.href ? theme.palette.primary.dark : "transparent",
    color: pathDirect === item?.href ? "#ffffff" : theme.palette.text.secondary,
    paddingLeft: hideMenu ? "10px" : level > 2 ? `${level * 15}px` : "10px",
    "&:hover": {
      backgroundColor:
        pathDirect === item?.href
          ? theme.palette.primary.dark
          : theme.palette.action.hover,
      color: pathDirect === item?.href ? "#ffffff" : theme.palette.primary.main,
    },
    "&.Mui-selected": {
      color: "#ffffff",
      backgroundColor: theme.palette.primary.dark,
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
        color: "#ffffff",
      },
    },
  }));

  return (
    <List component="li" disablePadding key={item?.id && item.title}>
      {item?.external ? (
        <a
          href={item?.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <ListItemStyled
            disabled={item?.disabled}
            selected={pathDirect === item?.href}
            onClick={lgDown ? onClick : undefined}
          >
            <ListItemIcon
              sx={{
                minWidth: "36px",
                p: "3px 0",
                color: pathDirect === item?.href ? "#ffffff" : "inherit",
              }}
            >
              {itemIcon}
            </ListItemIcon>
            <ListItemText>
              {hideMenu ? "" : <>{item?.title}</>}
              {item?.subtitle && !hideMenu && (
                <>
                  <br />
                  <Typography variant="caption">{item?.subtitle}</Typography>
                </>
              )}
            </ListItemText>

            {!item?.chip || hideMenu ? null : (
              <Chip
                color={item?.chipColor}
                variant={item?.variant ? item?.variant : "filled"}
                size="small"
                label={item?.chip}
              />
            )}
          </ListItemStyled>
        </a>
      ) : (
        <Link to={item.href} style={{ textDecoration: "none" }}>
          <ListItemStyled
            disabled={item?.disabled}
            selected={pathDirect === item?.href}
            onClick={lgDown ? onClick : undefined}
          >
            <ListItemIcon
              sx={{
                minWidth: "36px",
                p: "3px 0",
                color: pathDirect === item?.href ? "#ffffff" : "inherit",
              }}
            >
              {itemIcon}
            </ListItemIcon>
            <ListItemText>
              {hideMenu ? "" : <>{item?.title}</>}
              {item?.subtitle && !hideMenu && (
                <>
                  <br />
                  <Typography variant="caption">{item?.subtitle}</Typography>
                </>
              )}
            </ListItemText>

            {!item?.chip || hideMenu ? null : (
              <Chip
                color={item?.chipColor}
                variant={item?.variant ? item?.variant : "filled"}
                size="small"
                label={item?.chip}
              />
            )}
          </ListItemStyled>
        </Link>
      )}
    </List>
  );
}
