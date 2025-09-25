import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    return Response.json({
      status: "API is working",
      message: "This endpoint is accessible",
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    return Response.json({
      error: "API test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
