import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/backend/application/users/GetUserById";
import { updateUser } from "@/backend/application/users/UpdateUser";
import { deleteUser } from "@/backend/application/users/DeleteUser";
import { PrismaUserRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaUserRepository";

const repo = new PrismaUserRepository();

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getUserById(repo, id);
    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { email, name } = body as { email?: string; name?: string };

    const user = await updateUser(repo, id, { email, name });
    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("no encontrado") ? 404
      : message.includes("ya está en uso") ? 409
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await deleteUser(repo, id);
    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
