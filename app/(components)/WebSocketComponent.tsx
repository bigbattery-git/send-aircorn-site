"use client"

import axios from "axios";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface WebSocketData {
    type : "SYSTEM" | "CHAT" | "AIRCORN" | "ERROR",
    nickname : string,
    message ?: string,
    lastTemp ?: number,
    createdAt ?: string 
}

export default function WebSocketComponent(){
    const wsRef = useRef<WebSocket | null>(null);
    const isNeedToReconnectRef = useRef<boolean>(false);

    const [messages, setMessages] = useState<WebSocketData[]>([]);
    const [input, setInput] = useState<string>("");
    const [nickname, setNickname] = useState<string>("");
    const [lastTemp, setLastTemp] = useState<WebSocketData>({
        type : "AIRCORN",
        nickname : "",
        lastTemp : 26
    });
    const [isConnectd, setIsConnected] = useState<boolean>(false);

    const [isloading, setIsLoading] = useState<boolean>(true);

    // 웹소켓 전용
    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

        if(!wsUrl){
            return;
        }

        const ws = new WebSocket(wsUrl);

        wsRef.current = ws;

        function connect(){
            ws.onopen = () => {
                setIsConnected(true);
            }

            ws.onmessage = (message) => {
                let data;

                try {
                    data = JSON.parse(message.data);
                } catch {
                    console.error("메시지 파싱 실패");
                    return;
                }

                if(data.type !== "AIRCORN"){
                    setMessages((prev) => [...prev, data]);
                } else {
                    setLastTemp(data);
                }
            }

            ws.onclose = () => {
                setIsConnected(false);
                console.log("서버 닫힘");

                if(isNeedToReconnectRef){
                    console.log("재연결 시도");
                    connect();
                }

            }

            ws.onerror = (e) => {
                console.error(e);
                isNeedToReconnectRef.current = true;
                setIsConnected(false);
            }
        }

        connect();
        

        return () => {
            isNeedToReconnectRef.current = false;
            ws.close();
        }
    }, []);

    // 처음 데이터 호출
    useEffect(() => {
        setIsLoading(true);

        axios.get("/api/chats").
        then((datas) => {
            let chatData = datas.data;

            setMessages((prev) => [...prev, ...chatData.datas]);

        }).catch((e) => {
            console.error(e);
            return;
        })

        console.log("/api/aircorns")
        axios.get("/api/aircorns").
        then((datas) => {
            if(typeof(datas.data.data.lastTemp) === "number"){
                setLastTemp({
                    type : "AIRCORN",
                    nickname : datas.data.data.nickname,
                    lastTemp : datas.data.data.lastTemp
                })
            }

        }).catch((e) => {
            console.error(e);
            return;
        });

        setIsLoading(false);
    }, []);

    function chatPostHandler(){

        const name = nickname.trim();
        const message = input.trim();

        if(!name || !message){
            alert("닉네임 또는 채팅 없음");
            return;
        }

        const request = {
            nickname : name,
            message : message
        } 

        const wsRequest = {
            type : "CHAT",
            ...request
        }

        const ws = wsRef.current;

        if(!ws || ws.readyState !== WebSocket.OPEN){
            return;
        }

        try {
            ws.send(JSON.stringify(wsRequest));

            axios.post("/api/chats", request).
            then((data) => {

            }).catch((e) => {
                console.error(e);
            })

            setInput("");
        } catch(e) {
            console.error(e);
        }
    }

        function aircornPostHandler(tempCount : number){

        console.log("함수 실행됨");

        const name = nickname.trim();
        const temp = lastTemp?.lastTemp;

        if(!name || !temp){
            alert("닉네임 없음");
            console.log("name", name);
            console.log("temp", temp);
            console.log("여기서 막힘");
            return;
        }

        const request = {
            nickname : name,
            lastTemp : temp + tempCount
        } 

        const wsRequest = {
            type : "AIRCORN",
            ...request
        }

        const ws = wsRef.current;

        if(!ws || ws.readyState !== WebSocket.OPEN){
            return;
        }

        try {
            ws.send(JSON.stringify(wsRequest));

            axios.post("/api/aircorns", request).
            then((data) => {

            }).catch((e) => {
                console.error(e);
            })
        } catch(e) {
            console.error(e);
        }
    }

    if(isloading){
        return <p>로딩 중</p>
    } else {
        return (
            <main className="p-6">
                <h1 className="text-4xl"> 웹소켓 연결 여부 :<span className={`text-${isConnectd ? "green-300" : "red-300"}`}>{isConnectd ? "연결 됨" : "연결 안 됨"} </span></h1>
                <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="여기에 닉네임 입력"
                />

                <hr/>

                <h1 className="text-2xl">온라인 에어컨</h1>
                <p className="text-xl">마지막 건드린 사람 : {lastTemp?.nickname}</p>
                <p className="text-xl">에어컨 온도 : {lastTemp.lastTemp}</p>
                <Image
                    src="/aircorn.jpg"
                    alt="에어컨"
                    width="100"
                    height="100"
                />
                <button className="px-6 py-6 bg-white border border-r-2 text-red-300 mx-2" onClick={() => {aircornPostHandler(-1);}}>-</button> 
                <button className="px-6 py-6 bg-white border border-r-2 text-green-300 mx-2" onClick={() => {aircornPostHandler(+1);}}>+</button>

                <hr/>

                <h1>채팅창</h1>
                <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="여기에 메시지 입력"
                />
                <button onClick={() => {chatPostHandler();}}>전송</button>
                <hr/>
                <ul>
                    {
                        messages.map((a, i) => (
                            <li key={i}>
                                [{a.nickname}] : [{a.message}]
                            </li>
                        ))
                    }
                </ul>
            </main>
        )
    }
}