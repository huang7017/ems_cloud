"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  type SelectChangeEvent,
  Grid,
  CircularProgress
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../reducer";
import { actions as temperatureActions } from "../../Temperature/reducer";
import type { IState } from "@/store/reducers";
import type { vrfAC, updateVrfACRequest } from "../types";
import { temperaturesSelector } from "../../Temperature/selector";

const EditAC = ({
  open,

  acData,
  setOpen,
}: {
  open: boolean;
  lng: string;
  acData: vrfAC | null;
  setOpen: (value: boolean) => void;
}) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: IState) => state.vrf);
  const temperatureSensors = useSelector(temperaturesSelector) || [];
  
  const [formData, setFormData] = useState<Partial<vrfAC>>({
    ac_name: "",
    ac_location: "",
    ac_number: 0,
    temperature_sensor_id: ""
  });

  useEffect(() => {
    // Load temperature sensors when component mounts
    dispatch(temperatureActions.getTemperatures());
  }, [dispatch]);

  useEffect(() => {
    if (open && acData) {
      setFormData({
        id: acData.id,
        vrf_id: acData.vrf_id,
        vrf_address: acData.vrf_address,
        ac_name: acData.ac_name,
        ac_location: acData.ac_location,
        ac_number: acData.ac_number,
        temperature_map_id: acData.temperature_map_id,
        temperature_sensor_id: acData.temperature_sensor_id,
        temperature_sensor_address: acData.temperature_sensor_address
      });
    }
  }, [open, acData]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10) || 0;
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const handleTemperatureSensorChange = (e: SelectChangeEvent) => {
    const sensorId = e.target.value;
    const selectedSensor = temperatureSensors.find(sensor => sensor.id.toString() === sensorId);
    
    setFormData(prev => ({ 
      ...prev, 
      temperature_sensor_id: sensorId,
      temperature_sensor_address: selectedSensor?.address || ""
    }));
  };

  const handleSubmit = () => {
    if (formData.id && formData.vrf_id) {
      const updateRequest: updateVrfACRequest = {
        id: formData.id,
        name: formData.ac_name || "",
        location: formData.ac_location || "",
        number: formData.ac_number || 0,
        temperature_sensor_id: formData.temperature_sensor_id || ""
      };
      dispatch(actions.editVrfAC(updateRequest));
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      PaperProps={{
        component: "form",
        style: { width: "500px" },
      }}
      onClose={handleClose}
    >
      <DialogTitle>編輯空調</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{xs:12}}>
            <TextField
              name="ac_name"
              label={ "空調名稱"}
              fullWidth
              value={formData.ac_name || ""}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid size={{xs:12}}>
            <TextField
              name="ac_location"
              label={"空調位置"}
              fullWidth
              value={formData.ac_location || ""}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid size={{xs:12}}>
            <TextField
              name="ac_number"
              label={ "空調編號"}
              fullWidth
              type="number"
              value={formData.ac_number || 0}
              onChange={handleNumberChange}
              required
            />
          </Grid>
          <Grid size={{xs:12}}>
            <FormControl fullWidth>
              <InputLabel id="temperature-sensor-label">
                { "溫度感應器"}
              </InputLabel>
              <Select
                variant="outlined"
                labelId="temperature-sensor-label"
                id="temperature-sensor-select"
                name="temperature_sensor_id"
                value={formData.temperature_sensor_id || ""}
                onChange={handleTemperatureSensorChange}
                label={ "溫度感應器"}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected || selected === "00000000-0000-0000-0000-000000000000") {
                    return <em>{ "請選擇"}</em>;
                  }
                  const sensor = temperatureSensors.find(s => s.id.toString() === selected);
                  return sensor?.address || selected;
                }}
              >
                {temperatureSensors.map((sensor) => (
                  <MenuItem key={sensor.id} value={sensor.id.toString()}>
                    {sensor.address}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          { "取消"}
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !formData.ac_name || !formData.ac_location || !formData.temperature_sensor_id || formData.temperature_sensor_id === "00000000-0000-0000-0000-000000000000"}
          variant="contained"
          color="primary"
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "儲存"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAC;
