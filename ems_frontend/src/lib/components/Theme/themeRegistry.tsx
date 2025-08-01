"use client";
import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import EmotionCacheProvider from "./emotionCache";
import { LicenseInfo } from "@mui/x-license";
import { baseDarkTheme, baselightTheme } from './DefaultColors';
import { shadows, darkshadows } from './Shadows';
import type { IState } from "../../../store/reducers";
import { useSelector } from "react-redux";
import { DarkThemeColors } from './DarkThemeColors';
import { LightThemeColors } from './LightThemeColors';
import typography from './Typography';
import * as locales from '@mui/material/locale';
import components from './Components';
import _ from 'lodash';
LicenseInfo.setLicenseKey(
  "1e471f551be5ddd0ac091ebfccfc55dcTz0xMDI4MTcsRT0xNzY0Mzg2ODc1MDAwLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1RMy0yMDI0LEtWPTI="
);


export const BuildTheme = (config: any = {}) => {
  const themeOptions = LightThemeColors.find((theme) => theme.name === config.theme);
  const darkthemeOptions = DarkThemeColors.find((theme) => theme.name === config.theme);
  const customizer = useSelector((state: IState) => state.customizer);
  const defaultTheme = customizer.activeMode === 'dark' ? baseDarkTheme : baselightTheme;
  const defaultShadow = customizer.activeMode === 'dark' ? darkshadows : shadows;
  const themeSelect = customizer.activeMode === 'dark' ? darkthemeOptions : themeOptions;
  const baseMode = {
    palette: {
      mode: customizer.activeMode,
    },
    shape: {
      borderRadius: customizer.borderRadius,
    },
    shadows: defaultShadow,
    typography: typography,
  };
  const theme = createTheme(
    _.merge({}, baseMode, defaultTheme, locales, themeSelect, {
      direction: config.direction,
    }),
  );
  theme.components = components(theme);

  return theme;
};
// This implementation is from emotion-js
// https://github.com/emotion-js/emotion/issues/2928#issuecomment-1319747902
function ThemeRegistry(props: { children: React.ReactNode }) {
  const { children } = props;
  const customizer = useSelector((state: IState) => state.customizer);
  const theme = BuildTheme({
    direction: customizer.activeDir,
    theme: customizer.activeTheme,
  });
  return (
    <EmotionCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </EmotionCacheProvider>
  );
}

export { ThemeRegistry };
