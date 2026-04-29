import Link from "next/link";

import { ThemeToggle } from "@/app/components/theme-toggle";
import {
  listTasksByUser,
  type Priority,
  type Size,
  type TaskRow,
} from "@/app/lib/db";
import { requireCurrentUser } from "@/app/lib/user";

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

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

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

export default async function TarefasPage() {
  const userName = await requireCurrentUser();
  const tasks = listTasksByUser(userName);
  const total = tasks.length;
  const grouped = PRIORITY_ORDER.map((priority) => ({
    priority,
    items: tasks.filter((task) => task.priority === priority),
  }));

  return (
    <main className="flex min-h-screen flex-col px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-foreground/10 bg-surface pl-2 pr-3.5 text-sm font-medium text-foreground/70 transition-all hover:bg-foreground/[0.04] hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Voltar
          </Link>
          <ThemeToggle />
        </div>

        <header className="mb-8 px-1">
          <p className="text-sm text-foreground/60">Suas missões</p>
          <h1 className="mt-2 text-[2rem] font-bold leading-tight tracking-tight sm:text-[2.25rem]">
            {total === 0 ? "Nada por aqui ainda" : "O que tá no quadro"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-foreground/60">
            {total === 0
              ? "Cria a primeira pela home, depois volta aqui."
              : `${total} ${total === 1 ? "tarefa" : "tarefas"} priorizadas — bora dar conta.`}
          </p>
        </header>

        {total === 0 ? <EmptyState /> : <PriorityGroups grouped={grouped} />}
      </div>
    </main>
  );
}

function PriorityGroups({
  grouped,
}: {
  grouped: ReadonlyArray<{ priority: Priority; items: ReadonlyArray<TaskRow> }>;
}) {
  return (
    <div className="space-y-8">
      {grouped.map(({ priority, items }) =>
        items.length === 0 ? null : (
          <section key={priority} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                {PRIORITY_LABELS[priority]}
              </h2>
              <span
                className={[
                  "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold ring-1",
                  PRIORITY_BADGE[priority],
                ].join(" ")}
              >
                {items.length}
              </span>
            </div>
            <ul className="space-y-2">
              {items.map((task) => (
                <li
                  key={task.id}
                  className="rounded-2xl border border-foreground/[0.06] bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                >
                  <p className="text-base leading-relaxed text-foreground">
                    {task.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs ring-1",
                        SIZE_BADGE[task.size],
                      ].join(" ")}
                    >
                      <span className="font-mono font-semibold tracking-wide">
                        {task.size}
                      </span>
                      <span className="opacity-70">{SIZE_HINTS[task.size]}</span>
                    </span>
                    <span className="text-xs text-foreground/40">
                      · {timeAgo(task.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ),
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-foreground/[0.06] bg-surface p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="text-base font-semibold">Quadro vazio</p>
      <p className="mt-1 text-sm text-foreground/60">
        Suas tarefas vão aparecer aqui assim que você cadastrar a primeira.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-brand to-fuchsia-500 px-6 text-sm font-semibold text-brand-contrast shadow-[0_8px_24px_-8px_rgba(130,10,209,0.5)] transition-all hover:scale-[1.02] hover:shadow-[0_12px_32px_-8px_rgba(130,10,209,0.6)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        Cadastrar tarefa
      </Link>
    </div>
  );
}
