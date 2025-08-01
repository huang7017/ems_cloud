
export type createTemperatureRequest = {
    address: string,
}

export type createTemperatureResponse = {
    success: boolean,
    message: string,
    data: temperature,
}

export type temperature = {
    id: number,
    address: string,
    created_at: string,
    updated_at: string,
}

export type getTemperaturesResponse = {
    success: boolean,
    message: string,
    data: temperature[],
}
