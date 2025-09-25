import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Try to create a user to test if tables exist
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        role: 'CUSTOMER'
      }
    });
    
    // Delete the test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    
    return Response.json({
      success: true,
      message: "Database is working! You can now create provider profiles.",
      databaseConnected: true
    });
    
  } catch (error) {
    return Response.json({
      success: false,
      error: "Database setup failed",
      message: "Please check your DATABASE_URL in Vercel environment variables",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
