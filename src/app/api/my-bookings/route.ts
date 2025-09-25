import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        customer: {
          email: session.user.email
        }
      },
      include: {
        service: true,
        provider: {
          include: {
            user: true
          }
        },
        timeSlot: true,
        payment: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return Response.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
