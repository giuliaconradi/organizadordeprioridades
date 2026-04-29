import { NextResponse } from "next/server";

import {
  createTask,
  listTasksByUser,
  type Priority,
  type Size,
} from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/user";

const PRIORITIES = ["alta", "media", "baixa"] as const satisfies ReadonlyArray<Priority>;
const SIZES = ["P", "M", "G", "GG"] as const satisfies ReadonlyArray<Size>;

const MAX_DESCRIPTION_LENGTH = 1000;

function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && (PRIORITIES as ReadonlyArray<string>).includes(value);
}

function isSize(value: unknown): value is Size {
  return typeof value === "string" && (SIZES as ReadonlyArray<string>).includes(value);
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function unauthorized() {
  return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
}

export async function POST(request: Request) {
  const userName = await getCurrentUser();
  if (!userName) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("JSON inválido");
  }

  if (typeof body !== "object" || body === null) {
    return badRequest("Payload precisa ser um objeto");
  }

  const { description, priority, size } = body as Record<string, unknown>;

  const trimmedDescription =
    typeof description === "string" ? description.trim() : "";
  if (trimmedDescription.length === 0) {
    return badRequest("Descrição é obrigatória");
  }
  if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
    return badRequest(
      `Descrição muito longa (máx ${MAX_DESCRIPTION_LENGTH} caracteres)`,
    );
  }
  if (!isPriority(priority)) {
    return badRequest("Prioridade inválida");
  }
  if (!isSize(size)) {
    return badRequest("Tamanho inválido");
  }

  const task = createTask({
    userName,
    description: trimmedDescription,
    priority,
    size,
  });

  return NextResponse.json(task, { status: 201 });
}

export async function GET() {
  const userName = await getCurrentUser();
  if (!userName) return unauthorized();
  return NextResponse.json({ tasks: listTasksByUser(userName) });
}
