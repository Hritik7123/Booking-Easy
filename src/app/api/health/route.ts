import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return Response.json({
    status: "working",
    message: "API is working",
    timestamp: new Date().toISOString()
  });
}