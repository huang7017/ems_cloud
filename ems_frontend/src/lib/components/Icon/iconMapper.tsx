import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import TaskIcon from "@mui/icons-material/Task";
import BiotechIcon from "@mui/icons-material/Biotech";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import ListIcon from "@mui/icons-material/List";
import PolicyIcon from "@mui/icons-material/Policy";
import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PagesIcon from "@mui/icons-material/Pages";
type IconName =
  | "HomeIcon"
  | "SettingsIcon"
  | "PersonIcon"
  | "TaskIcon"
  | "BiotechIcon"
  | "SatelliteAltIcon"
  | "CoronavirusIcon"
  | "ListIcon"
  | "PolicyIcon"
  | "PeopleIcon"
  | "StoreIcon"
  | "PointOfSaleIcon"
  | "PagesIcon";

export const getIcon = (iconName: string): React.ReactNode => {
  switch (iconName) {
    case "HomeIcon":
      return <HomeIcon />;
    case "SettingsIcon":
      return <SettingsIcon />;
    case "PersonIcon":
      return <PersonIcon />;
    case "TaskIcon":
      return <TaskIcon />;
    case "BiotechIcon":
      return <BiotechIcon />;
    case "SatelliteAltIcon":
      return <SatelliteAltIcon />;
    case "CoronavirusIcon":
      return <CoronavirusIcon />;
    case "ListIcon":
      return <ListIcon />;
    case "PolicyIcon":
      return <PolicyIcon />;
    case "PeopleIcon":
      return <PeopleIcon />;
    case "StoreIcon":
      return <StoreIcon />;
    case "PointOfSaleIcon":
      return <PointOfSaleIcon />;
    case "PagesIcon":
      return <PagesIcon />;
    default:
      return <HomeIcon />;
  }
};

export type { IconName };
