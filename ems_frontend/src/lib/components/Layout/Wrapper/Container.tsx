"use client";
import { Container as MuiContainer} from "@mui/material";
import { useSelector } from "react-redux";
import type { IState } from "@/store/reducers";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/zh-tw';

const Container = ({ children }: { children: React.ReactNode }) => {
  const customizer = useSelector((state: IState) => state.customizer);
    return (
      <MuiContainer
        sx={{
          maxWidth: customizer.isLayout === "boxed" ? "lg" : "100%!important",
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
          {children}
        </LocalizationProvider>
      </MuiContainer>
    );
}
export default Container;
export {Container};