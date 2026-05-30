interface POSTChatsResponse {
    success : boolean,
    message : string | null,
    data ?: {
        nickname : string,
        message : string
    }
}

type ChatData = {
    id : number,
    nickname : string,
    message : string
}

interface GETChatsResponse{
    success : boolean,
    message : string | null,
    datas ?: ChatData[] | null,
    last_page ?: number,
    total ?: number
}