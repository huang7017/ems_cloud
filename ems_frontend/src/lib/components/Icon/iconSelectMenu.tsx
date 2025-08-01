import React from "react";
import {
  Autocomplete,
  TextField,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@mui/material";
import { getIcon } from "./iconMapper";
import type { IconName } from "./iconMapper";

interface IconSelectMenuFc {
  label: string;
  iconName: IconName;
  onChange: (
    event: React.SyntheticEvent<Element, Event>,
    value: IconName | null
  ) => void;
}

const options = [
  { label: `Home`, value: "HomeIcon" },
  { label: `Accounting`, value: "PointOfSaleIcon" },
  { label: `Settings`, value: "SettingsIcon" },
  { label: `Person`, value: "PersonIcon" },
  { label: `PeopleIcon`, value: "PeopleIcon" },
  { label: `StoreIcon`, value: "StoreIcon" },
];

const IconSelectMenu: React.FC<IconSelectMenuFc> = ({
  label,
  iconName,
  onChange,
}) => {
  return (
    <>
      <Autocomplete
        value={options.find((option) => option.value === iconName) || null}
        options={options}
        getOptionLabel={(option) => option.label}
        renderOption={(props, option) => (
          <MenuItem {...props} key={option.label}>
            <ListItemIcon>{getIcon(option.value as IconName)}</ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        )}
        onChange={(event, option) => {
          const value = option ? (option.value as IconName) : null;
          onChange(event, value);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            InputProps={{
              ...params.InputProps,
              startAdornment: iconName ? getIcon(iconName) : null,
            }}
          />
        )}
      />
    </>
  );
};

export default IconSelectMenu;
