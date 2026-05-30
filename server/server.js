const { WebSocketServer , WebSocket} = require("ws");

const PORT = 4000;

const wss = new WebSocketServer({
    port : PORT
})

console.log("서버 팜 : ws://localhost:4000");

wss.on("connection", (ws, req) => {
    console.log("누가 서버 들어옴 : ", req.socket.remoteAddress);

    ws.send(JSON.stringify({
        type : "SYSTEM",
        message : "서버 접속을 완료했습니다.",
        createdAt : new Date().toISOString()
    }));

    ws.on("message", (data) => {
        const text = data.toString();

        console.log("메시지 받음 : ", text);
        let perses;
        try{
            perses = JSON.parse(text);
        } catch {
            ws.send(JSON.stringify({
                type : "ERROR",
                message : "json 형태가 아닙니다",
                createdAt : new Date().toISOString()
            }))

            return;
        }

        let response = {}

        switch(perses.type){
            case "CHAT" : 
            response = {
                type : "CHAT",
                nickname : perses.nickname,
                message : perses.message,
                createdAt : new Date().toISOString()
            }
            break;

            case "AIRCORN" : 
            response = {
                type : "AIRCORN",
                nickname : perses.nickname,
                lastTemp : perses.lastTemp,
                createdAt : new Date().toISOString()
            }
            break;
        }

        wss.clients.forEach((client) => {
            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify(response));
            }
        });
    })

    ws.on("close", () => {
        console.log("서버 닫힘 : ", req.socket.remoteAddress);
    })

    ws.on("error", (e) => {
        console.error("에러 발생 : ", e);
    })
})