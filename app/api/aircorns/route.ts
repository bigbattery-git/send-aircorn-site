import { prisma } from "../../../lib/prisma"
import { NextRequest, NextResponse } from "next/server";

export async function GET(req : NextRequest){
    const searchParams = req.nextUrl.searchParams; // 의미 없음

    const response : GETAircornResponse = {
        success : false,
        message : null
    }
    try{
        const lastAircornData = await prisma.aircornLog.findFirst({
            select : {
                id : true,
                nickname : true,
                lastTemp : true
            },
            orderBy : {
                id : "desc"
            }
        })

        response.success = true;
        response.message = "조회에 성공했습니다.";
        response.data = lastAircornData;

        return NextResponse.json(response, {status:200});
    } catch (e){
        console.error("GET /api/aircorns : ", e);
        response.message = "서버 오류가 발생했습니다."
        return NextResponse.json(response, {status : 500});
    }
}

export async function POST(req : NextRequest){
    // nickname, lastTemp
    const data = await req.json();

    const response : POSTAircornsResponse = {
        success : false,
        message : null 
    }

    if(!data){
        response.message = "보낸 데이터가 없어요";
        console.error("POST /api/aircorns : ", response.message);
        return NextResponse.json(response, {status : 400});
    }

    if(!data.nickname){
        response.message = "닉네임을 보내세요";
        console.error("POST /api/aircorns : ", response.message);
        return NextResponse.json(response, {status : 400});
    }

    if(!data.lastTemp){
        response.message = "마지막 온도를 보내세요";
        console.error("POST /api/aircorns : ", response.message);
        return NextResponse.json(response, {status : 400});
    }

    try{
        const responseData = {
            nickname : data.nickname,
            lastTemp : data.lastTemp
        }

        const result = await prisma.aircornLog.create({
            data : responseData
        });

        response.success = true;
        response.message = "데이터 추가 완료입니다.";
        response.data = responseData;

        return NextResponse.json(response, {status: 200});
    }catch (e) {
        console.error("POST /api/aircorns : ", e);
        response.message = "서버 오류가 발생했습니다";
        return NextResponse.json(response, {status : 500});
    }
}