"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE, MAX_NAME_LENGTH, USER_COOKIE } from "@/app/lib/user";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const ONE_DAY_SECONDS = 60 * 60 * 24;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "giu1234adm";

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export async function setUser(formData: FormData) {
  const raw = formData.get("name");
  const name = typeof raw === "string" ? raw.trim() : "";

  if (name.length === 0) {
    redirect("/entrar?error=vazio");
  }
  if (name.length > MAX_NAME_LENGTH) {
    redirect("/entrar?error=longo");
  }

  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE, name, {
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE);
  redirect("/entrar");
}

export async function loginAdmin(formData: FormData) {
  const raw = formData.get("password");
  const password = typeof raw === "string" ? raw : "";

  if (password.length === 0) {
    redirect("/admin/entrar?error=vazia");
  }
  if (!safeCompare(password, ADMIN_PASSWORD)) {
    redirect("/admin/entrar?error=incorreta");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_DAY_SECONDS,
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect("/admin/entrar");
}
