export interface MeterResponse {
  id: string;
  meter_type: number;
  meter_id: string;
  total_watt: number;
  timestamp: string; // Using string for the ISO date format
}

export interface VrfSystem {
  id: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface VrfSensor {
  id: string;
  vrf_id: string;
  vrf_address: string;
  ac_name: string;
  ac_location: string;
  ac_number: number;
  temperature_map_id: string;
  temperature_sensor_id: string;
  temperature_sensor_address: string;
}

export interface TemperatureReading {
  id: string;
  sensor_id: string;
  temperature: number;
  humidity: number;
  heat_index: number;
  read_at: string;
  created_at: string;
}

