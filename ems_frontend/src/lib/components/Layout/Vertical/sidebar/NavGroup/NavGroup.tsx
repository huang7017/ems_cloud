"use client";
import ListSubheader from "@mui/material/ListSubheader";
import Box from "@mui/material/Box";
import { styled, alpha, useTheme } from "@mui/material/styles";
import { IoEllipsisHorizontal } from "react-icons/io5";

type NavGroup = {
  navlabel?: boolean;
  subheader?: string;
};

interface ItemType {
  item: NavGroup;
  hideMenu: string | boolean;
}

const NavGroup = ({ item, hideMenu }: ItemType) => {
  const theme = useTheme();

  const ListSubheaderStyle = styled((props: any) => (
    <ListSubheader disableSticky {...props} />
  ))(() => ({
    ...theme.typography.overline,
    fontWeight: 700,
    fontSize: "0.7rem",
    letterSpacing: "0.08em",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    color: alpha(theme.palette.text.primary, 0.5),
    lineHeight: "24px",
    padding: "4px 16px",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),

    "&::after": hideMenu
      ? {}
      : {
          content: '""',
          flex: 1,
          height: 1,
          backgroundColor: alpha(theme.palette.divider, 0.4),
          marginLeft: theme.spacing(1.5),
        },
  }));

  return (
    <ListSubheaderStyle>
      {hideMenu ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            color: alpha(theme.palette.text.secondary, 0.5),
          }}
        >
          <IoEllipsisHorizontal size={16} />
        </Box>
      ) : (
        item?.subheader
      )}
    </ListSubheaderStyle>
  );
};

export default NavGroup;
