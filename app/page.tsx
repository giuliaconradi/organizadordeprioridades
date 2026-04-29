import { TaskForm } from "./components/task-form";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16 font-sans">
      <div className="w-full max-w-xl">
        <header className="mb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-foreground/50">
            Nova tarefa
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            O que precisa sair do papel?
          </h1>
          <p className="mt-3 text-sm text-foreground/60">
            Descreva a tarefa e classifique. A IA pega daqui depois.
          </p>
        </header>
        <TaskForm />
      </div>
    </main>
  );
}
