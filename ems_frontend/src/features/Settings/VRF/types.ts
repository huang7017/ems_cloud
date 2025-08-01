export type createVRFSystemRequest = {
    address: string,
}

export type createVRFSystemResponse = {
    success: boolean,
    message: string,
    data: vrfSystem,
}

export type vrfSystem = {
    id: string,
    address: string,
    created_at: string,
    updated_at: string,
}

export type getVRFSystemsResponse = {
    success: boolean,
    message: string,
    data: vrfSystem[],
}



export type vrfAC = {
	id: string,
	vrf_id: string,
	vrf_address: string,
	ac_name: string,
	ac_location: string,
	ac_number: number,
	temperature_map_id: string,
	temperature_sensor_id: string,
	temperature_sensor_address: string,
}

export type getVrfACResponse = {
    success: boolean,
    message: string,
    data: vrfAC[],
}

export type updateVrfACRequest = {
        id: string,
        name: string,
        location: string,
        number: number,
        temperature_sensor_id: string,
}

export type createIoModuleRequest = {
    channel: number,
    vrf: string
}

export type ioModule = {
    id: string,
    channel: number,
    vrf: string,
}

