import {prisma} from "../../../lib/prisma"
import { NextRequest, NextResponse } from "next/server";

export async function GET(req : NextRequest){
    const searchParams = req.nextUrl.searchParams; // 의미 없음

    const persePage = Number(searchParams.get("page"));

    const page = Number.isInteger(persePage) && persePage > 0 ? persePage : 1;

    const response : GETChatsResponse = {
        success : false,
        message : null,
    }

    try{
        const [datas, total] = await prisma.$transaction([
                prisma.chatLog.findMany({
                select : {
                    id : true,
                    nickname : true,
                    message : true
                },
                orderBy : {
                    id : "desc"
                },
                take : 10,
                skip : (page - 1) * 10
            }),
            prisma.chatLog.count()
        ])

        response.message = "댓글 조회를 완료했습니다";
        response.datas = datas;
        response.last_page = Math.ceil(total/10);
        response.total = total;

        return NextResponse.json({response}, {status : 200});
    } catch (e) {
        response.message = "서버 오류가 발생했습니다.";
        console.error ("GET /api/chats : ", e);
        return NextResponse.json(response, {status : 500});
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