import Link from "next/link";

import { logout } from "./actions/auth";
import { TaskForm } from "./components/task-form";
import { ThemeToggle } from "./components/theme-toggle";
import { requireCurrentUser } from "./lib/user";

function ChevronRightIcon({ className }: { className?: string }) {
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default async function Page() {
  const userName = await requireCurrentUser();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-lg">
        <header className="mb-8 flex items-start justify-between gap-4 px-1">
          <div>
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <span>Oi, {userName}!</span>
              <span aria-hidden="true">·</span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded text-sm text-foreground/50 underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  sair
                </button>
              </form>
            </div>
            <h1 className="mt-2 text-[2rem] font-bold leading-tight tracking-tight sm:text-[2.25rem]">
              O que vamos organizar?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-foreground/60">
              Me conta o que precisa organizar e eu te ajudo.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/tarefas"
              className="inline-flex h-9 items-center gap-1 rounded-full border border-foreground/10 bg-surface pl-3.5 pr-2 text-sm font-medium text-foreground/70 transition-all hover:bg-foreground/[0.04] hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Tarefas
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <section className="rounded-3xl border border-foreground/[0.06] bg-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-8">
          <TaskForm />
        </section>
      </div>
    </main>
  );
}
