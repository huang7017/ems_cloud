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
import { styled, useTheme, alpha } from "@mui/material/styles";
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

  const itemIcon = item?.icon;
  const isActive = pathDirect === item?.href;
  const isNested = level && level > 1;

  const ListItemStyled = styled(ListItemButton)(() => ({
    position: "relative",
    whiteSpace: "nowrap",
    marginBottom: "4px",
    padding: hideMenu ? "10px" : isNested ? "10px 12px 10px 24px" : "12px 16px",
    gap: hideMenu ? "0" : "12px",
    borderRadius: `${customizer.borderRadius}px`,
    backgroundColor: isActive
      ? alpha(theme.palette.primary.main, 0.12)
      : "transparent",
    color: isActive
      ? theme.palette.primary.main
      : theme.palette.text.secondary,
    fontWeight: isActive ? 600 : 400,
    justifyContent: hideMenu ? "center" : "flex-start",

    // Active indicator bar - hide when collapsed
    "&::before": hideMenu ? {} : {
      content: '""',
      position: "absolute",
      left: 0,
      top: "50%",
      transform: "translateY(-50%)",
      width: isActive ? "4px" : "0px",
      height: isActive ? "60%" : "0%",
      backgroundColor: theme.palette.primary.main,
      borderRadius: "0 4px 4px 0",
      transition: "all 0.2s ease-in-out",
    },

    "&:hover": {
      backgroundColor: isActive
        ? alpha(theme.palette.primary.main, 0.16)
        : alpha(theme.palette.primary.main, 0.06),
      color: theme.palette.primary.main,

      "&::before": hideMenu ? {} : {
        width: "4px",
        height: "40%",
      },

      "& .MuiListItemIcon-root": {
        color: theme.palette.primary.main,
        transform: "scale(1.1)",
      },
    },

    "&.Mui-selected": {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
      color: theme.palette.primary.main,

      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.16),
      },
    },
  }));

  const iconStyle = {
    minWidth: "auto",
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: `${customizer.borderRadius}px`,
    backgroundColor: isActive
      ? alpha(theme.palette.primary.main, 0.1)
      : "transparent",
    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
    transition: "all 0.2s ease-in-out",
    "& svg": {
      fontSize: "1.25rem",
    },
  };

  const content = (
    <ListItemStyled
      disabled={item?.disabled}
      selected={isActive}
      onClick={lgDown ? onClick : undefined}
    >
      <ListItemIcon sx={iconStyle}>{itemIcon}</ListItemIcon>
      <ListItemText
        primary={
          hideMenu ? null : (
            <Typography
              variant="body2"
              sx={{
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.875rem",
                letterSpacing: "0.01em",
              }}
            >
              {item?.title}
            </Typography>
          )
        }
        secondary={
          item?.subtitle && !hideMenu ? (
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, fontSize: "0.75rem" }}
            >
              {item?.subtitle}
            </Typography>
          ) : null
        }
      />
      {!item?.chip || hideMenu ? null : (
        <Chip
          color={item?.chipColor || "primary"}
          variant={item?.variant || "filled"}
          size="small"
          label={item?.chip}
          sx={{
            height: 22,
            fontSize: "0.7rem",
            fontWeight: 600,
          }}
        />
      )}
    </ListItemStyled>
  );

  return (
    <List component="li" disablePadding key={item?.id && item.title}>
      {item?.external ? (
        <a
          href={item?.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          {content}
        </a>
      ) : (
        <Link to={item.href} style={{ textDecoration: "none" }}>
          {content}
        </Link>
      )}
    </List>
  );
}
