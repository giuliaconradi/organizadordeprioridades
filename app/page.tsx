import { TaskForm } from "./components/task-form";
import { ThemeToggle } from "./components/theme-toggle";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-lg">
        <header className="mb-8 flex items-start justify-between gap-4 px-1">
          <div>
            <p className="text-sm text-foreground/60">Oi! :)</p>
            <h1 className="mt-2 text-[2rem] font-bold leading-tight tracking-tight sm:text-[2.25rem]">
              O que vamos organizar?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-foreground/60">
              Me conta o que precisa organizar e eu te ajudo.
            </p>
          </div>
          <ThemeToggle />
        </header>
        <section className="rounded-3xl border border-foreground/[0.06] bg-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-8">
          <TaskForm />
        </section>
      </div>
    </main>
  );
}
