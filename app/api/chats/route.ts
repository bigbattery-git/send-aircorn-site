import { Prisma, PrismaClient } from "../../../src/generated/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req : NextRequest){
    const searchParams = req.nextUrl.searchParams; // 의미 없음

    try{
        const prisma = new PrismaClient();

        const datas = await prisma.chatLog.findMany({
            select : {
                id : true,
                nickname : true,
                message : true
            },
            orderBy : {
                id : "asc"
            },
            take : 10,
        });

        return NextResponse.json({success : true, message : "데이터 조회를 성공했습니다.", datas : datas}, {status : 200});
    } catch (e) {
        console.error ("GET /api/chats : ", e);
        return NextResponse.json({success : false, message : "서버 오류가 발생했습니다."}, {status : 500});
    }
} 

interface POSTChatsResponse {
    success : boolean,
    message : string | null,
    data ?: {
        nickname : string,
        message : string
    }
}

export async function POST(req : NextRequest){
    const request = await req.json();

    const response : POSTChatsResponse = {
        success : false,
        message : null
    }

    if(!request){
        response.message = "데이터를 보내세요.";
        console.error ("POST /api/chats : ", response.message);
        return NextResponse.json(response, {status : 400});
    }

    if(!request.nickname){
        response.message = "닉네임을 적으세요.";
        console.error ("POST /api/chats : ", response.message);
        return NextResponse.json(response, {status : 400});
    }

    if(!request.message){
        response.message = "메시지를 적으세요.";
        console.error ("POST /api/chats : ", response.message);
        return NextResponse.json(response, {status : 400});
    }

    try {
        const prisma = new PrismaClient();

        const createData = {
            nickname : request.nickname,
            message : request.message
        }

        const result = await prisma.chatLog.create({
            data : createData
        });

        response.data = createData;
        response.success = true;
        response.message = "메시지 추가에 성공했습니다.";

        return NextResponse.json(response, {status : 200});
    }catch (e) {
        console.error ("POST /api/chats : ", e);
        response.message = "서버 오류가 발생했습니다.";
        return NextResponse.json(response, {status : 500});
    }
}