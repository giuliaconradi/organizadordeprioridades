import Link from "next/link";

import { loginAdmin } from "@/app/actions/auth";
import { ThemeToggle } from "@/app/components/theme-toggle";

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  vazia: "Digite a senha.",
  incorreta: "Senha incorreta.",
};

export default async function AdminEntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            ← Voltar ao app
          </Link>
          <ThemeToggle />
        </div>

        <header className="mb-8 px-1">
          <span className="inline-flex h-6 items-center rounded-full bg-orange-500/15 px-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600 ring-1 ring-orange-500/30 dark:text-orange-400">
            Admin
          </span>
          <h1 className="mt-3 text-[2rem] font-bold leading-tight tracking-tight sm:text-[2.25rem]">
            Senha de acesso
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-foreground/60">
            Visualização global das tarefas de todas as pessoas.
          </p>
        </header>

        <section className="rounded-3xl border border-foreground/[0.06] bg-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-8">
          <form action={loginAdmin} className="space-y-6">
            {errorMessage ? (
              <div
                role="alert"
                className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
              >
                {errorMessage}
              </div>
            ) : null}

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                required
                placeholder="••••••••"
                className="block w-full rounded-2xl border border-foreground/15 bg-background px-4 py-3 text-base text-foreground placeholder:text-foreground/30 transition-all focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
              />
            </div>

            <button
              type="submit"
              className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-fuchsia-500 px-6 text-base font-semibold text-brand-contrast shadow-[0_8px_24px_-8px_rgba(130,10,209,0.5)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_12px_32px_-8px_rgba(130,10,209,0.6)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              Entrar como admin
              <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
