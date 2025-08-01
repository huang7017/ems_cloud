"use client";
import { Box } from "@mui/material";

  
const Main = ({ children }: { children: React.ReactNode }) => {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          width: "100%",
        }}
      >
        {children}
      </Box>
    );
}
// export default Main;
export {Main};