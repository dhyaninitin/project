export const allVehicleTypes = [
    'Car',
    'Jeep',
    'LightDutyTruck',
]

export const chromeMediaType = {
    resource:1
}

export const chromeMediaBgType = {
    Transparent: 1,
    White: 2
}

export const vehicleScrapingStatus = {
    success: 1,
    noImages: 2,
    apiFailed: 3,
    partiallyFailed: 4,
    vehicleNotFound: 5,
    socketHungup: 6
}

export const chromeOptionKind = {
    primaryPaint: 68,
    seatTrim: 72,
    wheel: 41
}

export const colorsPriorityMap = {
    White: 1,
    Black: 2,
    Gray: 3,
    Silver: 4,
    Gold: 5,
    Red: 6,
    Blue: 7,
    Green: 8,
    Orange: 9,
    Yellow: 10,
    Brown: 11,
    Beige: 12
}

export const scraperLogs = {
    success: 1,
    inProgress:2,
    failed:3
}

export const logsTypes = {
    scraper:1,
    addition: 2,
    count:3,
    error:4
}

export const scraperTypes = {
    year:0,
    brand:1,
    model:2,
    trim:3,
    media:4
}

export const scraperMessages = {
    started:'scraper started',
    success:'scraper finished successfully',
    failed:'scraper failed'
}

