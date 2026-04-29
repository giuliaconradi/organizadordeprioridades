import Link from "next/link";

import { logoutAdmin } from "@/app/actions/auth";
import { ThemeToggle } from "@/app/components/theme-toggle";
import {
  listAllTasks,
  type Priority,
  type Size,
  type TaskRow,
} from "@/app/lib/db";

export const dynamic = "force-dynamic";

const PRIORITY_ORDER: ReadonlyArray<Priority> = ["alta", "media", "baixa"];

const PRIORITY_LABELS: Record<Priority, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const PRIORITY_BADGE: Record<Priority, string> = {
  alta: "bg-red-500/10 text-red-600 ring-red-500/30 dark:text-red-400",
  media: "bg-amber-500/10 text-amber-600 ring-amber-500/30 dark:text-amber-400",
  baixa: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400",
};

const SIZE_HINTS: Record<Size, string> = {
  P: "~1h",
  M: "~3h",
  G: "~1d",
  GG: "~3d+",
};

const SIZE_BADGE: Record<Size, string> = {
  P: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400",
  M: "bg-amber-500/10 text-amber-600 ring-amber-500/30 dark:text-amber-400",
  G: "bg-orange-500/10 text-orange-600 ring-orange-500/30 dark:text-orange-400",
  GG: "bg-red-500/10 text-red-600 ring-red-500/30 dark:text-red-400",
};

function timeAgo(sqliteDatetime: string): string {
  const ms =
    Date.now() - new Date(`${sqliteDatetime.replace(" ", "T")}Z`).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min atrás`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h atrás`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "ontem";
  return `${day} dias atrás`;
}

function priorityRank(p: Priority): number {
  return PRIORITY_ORDER.indexOf(p);
}

export default function AdminPage() {
  const all = listAllTasks();
  const total = all.length;

  const byUser = new Map<string, TaskRow[]>();
  for (const task of all) {
    const list = byUser.get(task.user_name) ?? [];
    list.push(task);
    byUser.set(task.user_name, list);
  }
  for (const tasks of byUser.values()) {
    tasks.sort((a, b) => {
      const diff = priorityRank(a.priority) - priorityRank(b.priority);
      return diff !== 0 ? diff : b.id - a.id;
    });
  }
  const users = Array.from(byUser.keys()).sort((a, b) => {
    if (a === "_legacy_") return 1;
    if (b === "_legacy_") return -1;
    return a.localeCompare(b, "pt-BR");
  });

  return (
    <main className="flex min-h-screen flex-col px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            ← Voltar ao app
          </Link>
          <div className="flex items-center gap-2">
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                sair do admin
              </button>
            </form>
            <ThemeToggle />
          </div>
        </div>

        <header className="mb-8 px-1">
          <span className="inline-flex h-6 items-center rounded-full bg-orange-500/15 px-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600 ring-1 ring-orange-500/30 dark:text-orange-400">
            Admin
          </span>
          <h1 className="mt-3 text-[2rem] font-bold leading-tight tracking-tight sm:text-[2.25rem]">
            Visão geral
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-foreground/60">
            {total === 0
              ? "Nenhuma tarefa registrada ainda."
              : `${users.length} ${users.length === 1 ? "pessoa" : "pessoas"} · ${total} ${total === 1 ? "tarefa" : "tarefas"} no total.`}
          </p>
        </header>

        {total === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {users.map((userName) => {
              const tasks = byUser.get(userName) ?? [];
              return (
                <section
                  key={userName}
                  className="rounded-3xl border border-foreground/[0.06] bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold tracking-tight">
                      {userName === "_legacy_" ? (
                        <span className="text-foreground/50 italic">
                          Tarefas legadas
                        </span>
                      ) : (
                        userName
                      )}
                    </h2>
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-foreground/[0.06] px-2 text-xs font-semibold text-foreground/70">
                      {tasks.length}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {tasks.map((task) => (
                      <li
                        key={task.id}
                        className="rounded-2xl border border-foreground/[0.06] bg-background p-4"
                      >
                        <p className="text-base leading-relaxed text-foreground">
                          {task.description}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={[
                              "inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium ring-1",
                              PRIORITY_BADGE[task.priority],
                            ].join(" ")}
                          >
                            {PRIORITY_LABELS[task.priority]}
                          </span>
                          <span
                            className={[
                              "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11px] ring-1",
                              SIZE_BADGE[task.size],
                            ].join(" ")}
                          >
                            <span className="font-mono font-semibold tracking-wide">
                              {task.size}
                            </span>
                            <span className="opacity-70">
                              {SIZE_HINTS[task.size]}
                            </span>
                          </span>
                          <span className="text-xs text-foreground/40">
                            · {timeAgo(task.created_at)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-foreground/[0.06] bg-surface p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="text-base font-semibold">Quadro vazio</p>
      <p className="mt-1 text-sm text-foreground/60">
        Quando alguém criar uma tarefa, ela aparece aqui.
      </p>
    </div>
  );
}
