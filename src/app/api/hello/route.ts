import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return Response.json({ 
    message: "Hello from API!",
    timestamp: new Date().toISOString(),
    status: "working"
  });
}

export async function POST(request: NextRequest) {
  return Response.json({ 
    message: "POST request received",
    timestamp: new Date().toISOString()
  });
}