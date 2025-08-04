"use client";
import { useSelector } from "react-redux";
import type { IState } from "@/store/reducers";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";

const Page = ({ children }: { children: React.ReactNode }) => {
  const customizer = useSelector((state: IState) => state.customizer);
  const theme = useTheme();
  return (
    <Box
      className="page-wrapper"
      sx={{
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
        zIndex: 1,
        backgroundColor: "transparent",
        ...(customizer.isCollapse && {
          [theme.breakpoints.up("lg")]: {
            ml: `${customizer.MiniSidebarWidth}px`,
          },
        }),
      }}
    >
      {children}
    </Box>
  );
};
// export default Page;
export { Page };
