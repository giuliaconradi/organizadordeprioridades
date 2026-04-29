"use client";

import { useId, useState, type FormEvent } from "react";

type Priority = "alta" | "media" | "baixa";
type Size = "P" | "M" | "G" | "GG";

const PRIORITIES: ReadonlyArray<{
  value: Priority;
  label: string;
  classes: { selected: string; ring: string };
}> = [
  {
    value: "alta",
    label: "Alta",
    classes: {
      selected: "bg-red-500/15 text-red-400 ring-red-500/40",
      ring: "ring-red-500/50",
    },
  },
  {
    value: "media",
    label: "Média",
    classes: {
      selected: "bg-amber-500/15 text-amber-400 ring-amber-500/40",
      ring: "ring-amber-500/50",
    },
  },
  {
    value: "baixa",
    label: "Baixa",
    classes: {
      selected: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/40",
      ring: "ring-emerald-500/50",
    },
  },
];

const SIZES: ReadonlyArray<{ value: Size; hint: string }> = [
  { value: "P", hint: "~1h" },
  { value: "M", hint: "~3h" },
  { value: "G", hint: "~1d" },
  { value: "GG", hint: "~3d+" },
];

export function TaskForm() {
  const descriptionId = useId();
  const priorityLabelId = useId();
  const sizeLabelId = useId();

  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isValid = description.trim().length > 0 && priority !== null && size !== null;

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
        className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-sm"
      >
        <p className="font-medium text-emerald-400">Tarefa criada</p>
        <p className="mt-1 text-foreground/60">
          Esse fluxo é só visual por enquanto — nada foi salvo.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Criar outra
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <div className="space-y-2">
        <label
          htmlFor={descriptionId}
          className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50"
        >
          Descrição
        </label>
        <textarea
          id={descriptionId}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ex: Revisar copy da landing page e ajustar CTA principal"
          rows={4}
          className="block w-full resize-none rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-foreground/30 transition-colors focus:border-foreground/40 focus:outline-none focus:ring-0"
        />
      </div>

      <div className="space-y-3">
        <p
          id={priorityLabelId}
          className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50"
        >
          Prioridade
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
                  "h-10 rounded-full px-4 text-sm font-medium transition-colors",
                  "ring-1 focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isSelected
                    ? `${option.classes.selected} ring-1`
                    : "ring-foreground/10 text-foreground/70 hover:ring-foreground/25 hover:text-foreground",
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p
          id={sizeLabelId}
          className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50"
        >
          Tempo de desenvolvimento
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
                  "flex h-10 items-center gap-2 rounded-full px-4 text-sm transition-colors",
                  "ring-1 focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isSelected
                    ? "bg-foreground text-background ring-foreground"
                    : "ring-foreground/10 text-foreground/70 hover:ring-foreground/25 hover:text-foreground",
                ].join(" ")}
              >
                <span className="font-mono font-medium tracking-wide">{option.value}</span>
                <span
                  className={[
                    "text-xs",
                    isSelected ? "text-background/70" : "text-foreground/40",
                  ].join(" ")}
                >
                  {option.hint}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-foreground/40">
          Estimativa em camisetas — escolha o que parecer mais próximo.
        </p>
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-30"
      >
        Criar tarefa
      </button>
    </form>
  );
}
