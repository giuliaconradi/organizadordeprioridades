import "server-only";

import { cookies } from "next/headers";

export const USER_COOKIE = "app_user";
export const ADMIN_COOKIE = "app_admin";
export const MAX_NAME_LENGTH = 50;

export async function getCurrentUser(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(USER_COOKIE)?.value?.trim();
  return value && value.length > 0 ? value : null;
}

export async function requireCurrentUser(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Usuário não autenticado");
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "1";
}
