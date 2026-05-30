interface POSTAircornsResponse {
    success : boolean,
    message : null | string,
    data ?: {
        nickname : string,
        lastTemp : number
    }
}

interface GETAircornResponse {
    success : boolean,
    message : null | string,
    data ?: {
        id : number,
        nickname : string,
        lastTemp : number
    } | null
}