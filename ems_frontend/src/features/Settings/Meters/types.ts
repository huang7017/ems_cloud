    export type createMeterRequest = {
    address: string,
}

export type createMeterResponse = {
    success: boolean,
    message: string,
    data: meter,
}

export type meter = {
    id: number,
    address: string,
    created_at: string,
    updated_at: string,
}

export type getMetersResponse = {
    success: boolean,
    message: string,
    data: meter[],
}
