"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";

type Priority = "alta" | "media" | "baixa";
type Size = "P" | "M" | "G" | "GG";

function FlameIcon({ className }: { className?: string }) {
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
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function LeafIcon({ className }: { className?: string }) {
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
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c1 4.5.5 8.31-1.3 11.04-1.32 2.05-3.4 3.34-5.9 3.34" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  );
}

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

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2zM19 14l.8 2.6L22 17.5l-2.2.9L19 21l-.8-2.6L16 17.5l2.2-.9L19 14zM5 14l.6 1.9L7.5 16.5l-1.9.6L5 19l-.6-1.9L2.5 16.5l1.9-.6L5 14z" />
    </svg>
  );
}

const PRIORITIES: ReadonlyArray<{
  value: Priority;
  label: string;
  selectedClass: string;
  icon: ReactNode;
}> = [
  {
    value: "alta",
    label: "Alta",
    selectedClass:
      "bg-red-500/15 text-red-600 ring-red-500/40 dark:text-red-400",
    icon: <FlameIcon className="h-4 w-4" />,
  },
  {
    value: "media",
    label: "Média",
    selectedClass:
      "bg-amber-500/15 text-amber-600 ring-amber-500/40 dark:text-amber-400",
    icon: <ClockIcon className="h-4 w-4" />,
  },
  {
    value: "baixa",
    label: "Baixa",
    selectedClass:
      "bg-emerald-500/15 text-emerald-600 ring-emerald-500/40 dark:text-emerald-400",
    icon: <LeafIcon className="h-4 w-4" />,
  },
];

const SIZES: ReadonlyArray<{
  value: Size;
  hint: string;
  selectedClass: string;
}> = [
  {
    value: "P",
    hint: "~1h",
    selectedClass:
      "bg-emerald-500/15 text-emerald-600 ring-emerald-500/40 dark:text-emerald-400",
  },
  {
    value: "M",
    hint: "~3h",
    selectedClass:
      "bg-amber-500/15 text-amber-600 ring-amber-500/40 dark:text-amber-400",
  },
  {
    value: "G",
    hint: "~1d",
    selectedClass:
      "bg-orange-500/15 text-orange-600 ring-orange-500/40 dark:text-orange-400",
  },
  {
    value: "GG",
    hint: "~3d+",
    selectedClass:
      "bg-red-500/15 text-red-600 ring-red-500/40 dark:text-red-400",
  },
];

const PROGRESS_LABELS = [
  "Vamos lá",
  "Bom começo",
  "Quase lá",
  "Tudo pronto!",
] as const;

export function TaskForm() {
  const descriptionId = useId();
  const priorityLabelId = useId();
  const sizeLabelId = useId();

  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const filled = [
    description.trim().length > 0,
    priority !== null,
    size !== null,
  ].filter(Boolean).length;
  const isValid = filled === 3;
  const progressLabel = PROGRESS_LABELS[filled];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;
    console.log({ description: description.trim(), priority, size });
    setSubmitted(true);
  }

  function reset() {
    setDescription("");
    setPriority(null);
    setSize(null);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="flex flex-col items-center py-6 text-center"
      >
        <span
          aria-hidden="true"
          className="relative flex h-16 w-16 items-center justify-center"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-brand/30" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand/15 text-brand">
            <SparkleIcon className="h-8 w-8" />
          </span>
        </span>
        <p className="mt-6 text-2xl font-bold tracking-tight">+1 missão!</p>
        <p className="mt-1 text-sm text-foreground/60">Tá voando, hein?</p>
        <button
          type="button"
          onClick={reset}
          className="group mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-brand to-fuchsia-500 px-6 text-sm font-semibold text-brand-contrast shadow-[0_8px_24px_-8px_rgba(130,10,209,0.5)] transition-all hover:scale-[1.02] hover:shadow-[0_12px_32px_-8px_rgba(130,10,209,0.6)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          Mais uma!
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7" noValidate>
      <div className="flex items-center justify-between">
        <span
          aria-live="polite"
          className={[
            "text-xs transition-colors duration-200",
            isValid ? "font-semibold text-brand" : "text-foreground/50",
          ].join(" ")}
        >
          {progressLabel}
        </span>
        <div
          aria-hidden="true"
          className="flex items-center gap-1.5"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={[
                "h-1.5 rounded-full transition-all duration-300",
                i < filled
                  ? "w-4 bg-brand"
                  : "w-1.5 bg-foreground/15",
              ].join(" ")}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor={descriptionId}
          className="block text-sm font-medium text-foreground"
        >
          Descreva sua tarefa
        </label>
        <textarea
          id={descriptionId}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Tipo: caçar o bug do checkout, mandar email pro cliente…"
          rows={4}
          className="block w-full resize-none rounded-2xl border border-foreground/15 bg-background px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-foreground/30 transition-all focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
        />
      </div>

      <div className="space-y-3">
        <p
          id={priorityLabelId}
          className="text-sm font-medium text-foreground"
        >
          Quão urgente?
        </p>
        <div
          role="radiogroup"
          aria-labelledby={priorityLabelId}
          className="flex flex-wrap gap-2"
        >
          {PRIORITIES.map((option) => {
            const isSelected = priority === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setPriority(option.value)}
                className={[
                  "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium ring-1 transition-all duration-200 active:scale-[0.97]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                  isSelected
                    ? `${option.selectedClass} scale-[1.03]`
                    : "ring-foreground/15 text-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground hover:ring-foreground/30",
                ].join(" ")}
              >
                {option.icon}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p
          id={sizeLabelId}
          className="text-sm font-medium text-foreground"
        >
          Nível de esforço
        </p>
        <div
          role="radiogroup"
          aria-labelledby={sizeLabelId}
          className="flex flex-wrap gap-2"
        >
          {SIZES.map((option) => {
            const isSelected = size === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSize(option.value)}
                className={[
                  "flex h-11 items-center gap-2 rounded-full px-4 text-sm ring-1 transition-all duration-200 active:scale-[0.97]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                  isSelected
                    ? `${option.selectedClass} scale-[1.03]`
                    : "ring-foreground/15 text-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground hover:ring-foreground/30",
                ].join(" ")}
              >
                <span className="font-mono font-semibold tracking-wide">
                  {option.value}
                </span>
                <span
                  className={[
                    "text-xs",
                    isSelected ? "opacity-70" : "text-foreground/40",
                  ].join(" ")}
                >
                  {option.hint}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-foreground/50">
          Estimativa em camisetas — vai com o que parecer mais próximo.
        </p>
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className={[
          "group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          isValid
            ? "bg-gradient-to-r from-brand to-fuchsia-500 text-brand-contrast shadow-[0_8px_24px_-8px_rgba(130,10,209,0.5)] hover:scale-[1.01] hover:shadow-[0_12px_32px_-8px_rgba(130,10,209,0.6)] active:scale-[0.99]"
            : "cursor-not-allowed bg-foreground/10 text-foreground/30",
        ].join(" ")}
      >
        Cadastrar
        {isValid ? (
          <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        ) : null}
      </button>
    </form>
  );
}
