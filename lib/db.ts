import { db } from "@/lib/db";

export async function GET() {
  const bookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Response.json(bookings);
}

export async function POST(req: Request) {
  const body = await req.json();

  const booking = await db.booking.create({
    data: {
      name: body.name,
      phone: body.phone,
      service: body.service,
      package: body.package,
      price: body.price,
      date: body.date,
      message: body.message,
    },
  });

  return Response.json(booking);
}