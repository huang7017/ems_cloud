import React from "react";
// Navigation & General
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuIcon from "@mui/icons-material/Menu";
import AppsIcon from "@mui/icons-material/Apps";

// Settings & Configuration
import SettingsIcon from "@mui/icons-material/Settings";
import TuneIcon from "@mui/icons-material/Tune";
import BuildIcon from "@mui/icons-material/Build";

// Users & People
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import GroupIcon from "@mui/icons-material/Group";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

// Security & Permissions
import SecurityIcon from "@mui/icons-material/Security";
import ShieldIcon from "@mui/icons-material/Shield";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PolicyIcon from "@mui/icons-material/Policy";
import LockIcon from "@mui/icons-material/Lock";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

// Business & Company
import BusinessIcon from "@mui/icons-material/Business";
import StoreIcon from "@mui/icons-material/Store";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import ApartmentIcon from "@mui/icons-material/Apartment";

// Devices & Hardware
import DevicesIcon from "@mui/icons-material/Devices";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import RouterIcon from "@mui/icons-material/Router";
import MemoryIcon from "@mui/icons-material/Memory";
import SensorsIcon from "@mui/icons-material/Sensors";

// Schedule & Time
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventIcon from "@mui/icons-material/Event";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AlarmIcon from "@mui/icons-material/Alarm";

// Analytics & Data
import AnalyticsIcon from "@mui/icons-material/Analytics";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InsightsIcon from "@mui/icons-material/Insights";

// Temperature & Environment
import ThermostatIcon from "@mui/icons-material/Thermostat";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import WbSunnyIcon from "@mui/icons-material/WbSunny";

// Energy & Power
import BoltIcon from "@mui/icons-material/Bolt";
import PowerIcon from "@mui/icons-material/Power";
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import EnergySavingsLeafIcon from "@mui/icons-material/EnergySavingsLeaf";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import OfflineBoltIcon from "@mui/icons-material/OfflineBolt";

// Lists & Pages
import ListIcon from "@mui/icons-material/List";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PagesIcon from "@mui/icons-material/Pages";
import ArticleIcon from "@mui/icons-material/Article";
import DescriptionIcon from "@mui/icons-material/Description";

// Tasks & Work
import TaskIcon from "@mui/icons-material/Task";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChecklistIcon from "@mui/icons-material/Checklist";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";

// Science & Tech
import BiotechIcon from "@mui/icons-material/Biotech";
import ScienceIcon from "@mui/icons-material/Science";

// Monitoring & Satellite
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import RadarIcon from "@mui/icons-material/Radar";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";

// Other
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ReceiptIcon from "@mui/icons-material/Receipt";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ReportIcon from "@mui/icons-material/Report";
import HistoryIcon from "@mui/icons-material/History";
import StorageIcon from "@mui/icons-material/Storage";
import CloudIcon from "@mui/icons-material/Cloud";
import SyncIcon from "@mui/icons-material/Sync";
import RefreshIcon from "@mui/icons-material/Refresh";
import MapIcon from "@mui/icons-material/Map";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RoomIcon from "@mui/icons-material/Room";

const iconMap: Record<string, React.ReactNode> = {
  // Navigation & General
  HomeIcon: <HomeIcon />,
  DashboardIcon: <DashboardIcon />,
  MenuIcon: <MenuIcon />,
  AppsIcon: <AppsIcon />,

  // Settings & Configuration
  SettingsIcon: <SettingsIcon />,
  TuneIcon: <TuneIcon />,
  BuildIcon: <BuildIcon />,

  // Users & People
  PersonIcon: <PersonIcon />,
  PeopleIcon: <PeopleIcon />,
  GroupIcon: <GroupIcon />,
  AccountCircleIcon: <AccountCircleIcon />,
  SupervisorAccountIcon: <SupervisorAccountIcon />,
  PersonAddIcon: <PersonAddIcon />,

  // Security & Permissions
  SecurityIcon: <SecurityIcon />,
  ShieldIcon: <ShieldIcon />,
  AdminPanelSettingsIcon: <AdminPanelSettingsIcon />,
  PolicyIcon: <PolicyIcon />,
  LockIcon: <LockIcon />,
  VpnKeyIcon: <VpnKeyIcon />,
  VerifiedUserIcon: <VerifiedUserIcon />,

  // Business & Company
  BusinessIcon: <BusinessIcon />,
  StoreIcon: <StoreIcon />,
  CorporateFareIcon: <CorporateFareIcon />,
  ApartmentIcon: <ApartmentIcon />,

  // Devices & Hardware
  DevicesIcon: <DevicesIcon />,
  DevicesOtherIcon: <DevicesOtherIcon />,
  RouterIcon: <RouterIcon />,
  MemoryIcon: <MemoryIcon />,
  SensorsIcon: <SensorsIcon />,

  // Schedule & Time
  ScheduleIcon: <ScheduleIcon />,
  EventIcon: <EventIcon />,
  CalendarTodayIcon: <CalendarTodayIcon />,
  AccessTimeIcon: <AccessTimeIcon />,
  AlarmIcon: <AlarmIcon />,

  // Analytics & Data
  AnalyticsIcon: <AnalyticsIcon />,
  BarChartIcon: <BarChartIcon />,
  ShowChartIcon: <ShowChartIcon />,
  TrendingUpIcon: <TrendingUpIcon />,
  AssessmentIcon: <AssessmentIcon />,
  InsightsIcon: <InsightsIcon />,

  // Temperature & Environment
  ThermostatIcon: <ThermostatIcon />,
  AcUnitIcon: <AcUnitIcon />,
  DeviceThermostatIcon: <DeviceThermostatIcon />,
  WbSunnyIcon: <WbSunnyIcon />,

  // Energy & Power
  BoltIcon: <BoltIcon />,
  PowerIcon: <PowerIcon />,
  ElectricMeterIcon: <ElectricMeterIcon />,
  EnergySavingsLeafIcon: <EnergySavingsLeafIcon />,
  FlashOnIcon: <FlashOnIcon />,
  OfflineBoltIcon: <OfflineBoltIcon />,

  // Lists & Pages
  ListIcon: <ListIcon />,
  ListAltIcon: <ListAltIcon />,
  PagesIcon: <PagesIcon />,
  ArticleIcon: <ArticleIcon />,
  DescriptionIcon: <DescriptionIcon />,

  // Tasks & Work
  TaskIcon: <TaskIcon />,
  AssignmentIcon: <AssignmentIcon />,
  ChecklistIcon: <ChecklistIcon />,
  PlaylistAddCheckIcon: <PlaylistAddCheckIcon />,

  // Science & Tech
  BiotechIcon: <BiotechIcon />,
  ScienceIcon: <ScienceIcon />,

  // Monitoring & Satellite
  SatelliteAltIcon: <SatelliteAltIcon />,
  RadarIcon: <RadarIcon />,
  MonitorHeartIcon: <MonitorHeartIcon />,

  // Other
  CoronavirusIcon: <CoronavirusIcon />,
  PointOfSaleIcon: <PointOfSaleIcon />,
  ReceiptIcon: <ReceiptIcon />,
  InventoryIcon: <InventoryIcon />,
  WarehouseIcon: <WarehouseIcon />,
  LocalShippingIcon: <LocalShippingIcon />,
  NotificationsIcon: <NotificationsIcon />,
  ReportIcon: <ReportIcon />,
  HistoryIcon: <HistoryIcon />,
  StorageIcon: <StorageIcon />,
  CloudIcon: <CloudIcon />,
  SyncIcon: <SyncIcon />,
  RefreshIcon: <RefreshIcon />,
  MapIcon: <MapIcon />,
  LocationOnIcon: <LocationOnIcon />,
  RoomIcon: <RoomIcon />,
};

export const getIcon = (iconName: string): React.ReactNode => {
  return iconMap[iconName] || <HomeIcon />;
};

// Export all available icon names for reference
export const availableIcons = Object.keys(iconMap);

export type IconName = keyof typeof iconMap;
