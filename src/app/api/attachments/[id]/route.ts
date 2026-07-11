import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const attachment = await prisma.taskAttachment.findUnique({
    where: { id },
    include: { task: true },
  });

  if (!attachment) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isAuthorized =
    session.user.role === "ADMIN" ||
    attachment.task.assignedToId === session.user.id;

  if (!isAuthorized) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return new NextResponse(new Uint8Array(attachment.data), {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.fileName)}"`,
      "Content-Length": String(attachment.size),
    },
  });
}
