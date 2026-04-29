@AGENTS.md

# Organizador de Prioridades

> Aplicação AI-first onde o usuário despeja conteúdo solto (texto, imagem, áudio, link) e a IA organiza prioridades automaticamente.

---

## 1. Visão do produto

O usuário não precisa preencher formulário. Ele cola um texto, sobe uma foto, grava um áudio ou joga um link — e a IA:

1. **Interpreta** o conteúdo bruto.
2. **Identifica** uma ou mais tarefas dentro dele.
3. **Resume** cada tarefa em título + descrição curta.
4. **Classifica urgência** (alta / média / baixa).
5. **Encaixa em um bucket temporal**: Hoje · Semana · Backlog · Aguardando.

Tudo numa **tela única**, com login simples por senha, uso individual.

### Fora de escopo do MVP
- Multiusuário, workspaces, compartilhamento.
- Integrações externas (Calendar, Slack, Linear, etc).
- Notificações push, email, mobile nativo.

---

## 2. Princípios

| Princípio | O que significa na prática |
|---|---|
| **AI-first** | Input bruto > formulário. Formulário manual é exceção (fallback). |
| **Atrito mínimo** | Uma tela. Um campo. Sem onboarding, sem wizard. |
| **Transparência** | Toda classificação da IA exibe o `reasoning` em hover/expand. |
| **Reversibilidade** | Usuário sempre pode mover task entre buckets, editar, deletar. |
| **Dark-first** | Estética Linear/Vercel. Geist. Espaçamento generoso. |

---

## 3. Stack & decisões de arquitetura

| Camada | Tecnologia | Notas críticas |
|---|---|---|
| Framework | **Next.js 16.2** (App Router) | Server Components default. `params`/`searchParams` são `Promise` — sempre `await`. `revalidateTag` exige 2 args (`tag`, `'max'`). Turbopack é o build padrão. |
| UI | **React 19.2** | `useActionState`, `useOptimistic`, `<form action={...}>` com Server Actions. |
| Styling | **Tailwind v4** | Sem `tailwind.config.js`. Customização via `@theme inline` em `app/globals.css`. CSS variables `--background`, `--foreground` mapeadas para `bg-foreground`/`text-foreground`. |
| DB & Auth | **Supabase** | Postgres + Row Level Security + Auth (email/senha) + Storage para uploads. |
| IA | **Claude Sonnet 4.6** | Multimodal nativo (imagem). Áudio passa por transcrição antes (Whisper API ou `@xenova/transformers`). |
| Validação | **zod** | Toda saída do Claude validada antes de inserir. |

---

## 4. Modelo de dados (Supabase Postgres)

```sql
-- gerenciado pelo Supabase Auth
-- auth.users (id uuid pk)

create type input_kind as enum ('text','image','audio','link');
create type processing_status as enum ('pending','processing','done','error');
create type task_priority as enum ('alta','media','baixa');
create type task_size     as enum ('P','M','G','GG');
create type task_bucket   as enum ('hoje','semana','backlog','aguardando');

create table public.inputs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  kind            input_kind not null,
  raw_content     text,                -- texto bruto, link, ou transcrição
  file_path       text,                -- caminho no Storage (imagem/áudio)
  status          processing_status not null default 'pending',
  error_message   text,
  created_at      timestamptz not null default now(),
  processed_at    timestamptz
);

create table public.tasks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  input_id        uuid references public.inputs(id) on delete set null,
  title           text not null,
  description     text,
  summary         text,                -- resumo de 1 frase
  priority        task_priority not null,
  size            task_size,           -- estimativa P/M/G/GG (opcional)
  bucket          task_bucket not null default 'backlog',
  ai_reasoning    text,                -- explicação da IA (transparência)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  completed_at    timestamptz,
  position        integer not null default 0  -- ordenação dentro do bucket
);

create index on public.tasks (user_id, bucket, position);
create index on public.inputs (user_id, status);
```

### RLS (Row Level Security)

```sql
alter table public.inputs enable row level security;
alter table public.tasks  enable row level security;

create policy "owner read"   on public.tasks for select using (auth.uid() = user_id);
create policy "owner write"  on public.tasks for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- idem para inputs
```

### Storage

Bucket privado `inputs/` com policy `auth.uid() = (storage.foldername(name))[1]::uuid` — cada usuário só acessa sua pasta.

---

## 5. Fluxo end-to-end

```
[usuário] ──► AI input (texto/upload/link)
   │
   ▼
[Server Action submitInput]
   ├─ insert em `inputs` (status=pending)
   ├─ se imagem/áudio: upload para Storage, salva file_path
   └─ enfileira processamento (in-process await OU queue)
   │
   ▼
[processInput] (Server Action ou Route Handler)
   ├─ áudio? → transcrever para texto
   ├─ monta prompt multimodal (texto + image blocks se houver)
   ├─ chama Claude com system prompt fixo + cache_control
   ├─ valida JSON com zod
   ├─ insert em `tasks`
   ├─ update inputs.status = 'done'
   └─ revalidateTag('tasks', 'max')
   │
   ▼
[UI dashboard] re-renderiza colunas Hoje/Semana/Backlog/Aguardando
```

**Mutations do usuário** (mover bucket, completar, deletar) são Server Actions diretas com optimistic update via `useOptimistic`.

---

## 6. UX & Design system

- **Tipografia**: Geist Sans (corpo), Geist Mono (números/etiquetas técnicas). Já configurada em `app/layout.tsx`.
- **Cores**: tudo deriva de `--background` / `--foreground` + opacidades (`text-foreground/60`, `ring-foreground/10`, etc). Acentos só em prioridade (red/amber/emerald) e estados (success/error).
- **Espaçamento**: generoso, max-width `xl` em telas focadas (form, login). Dashboard usa largura total com padding.
- **Motion**: `transition-colors duration-150` no padrão. Page transitions só com `<ViewTransition>` do React 19 quando justificar.
- **Estados que TODO componente precisa cobrir**:
  - Empty (sem dados ainda → CTA pra primeiro input)
  - Loading (skeleton, não spinner — exceto botões)
  - Error (banner inline com retry)
  - Success (banner verde discreto, não toast modal)
- **Acessibilidade**: keyboard-first. `focus-visible:ring-2`. `aria-pressed`/`aria-checked` em chips. Contraste AA em texto secundário.

---

## 7. Integração Claude

### System prompt (estável → cacheado)

Coloca o prompt grande com `cache_control: { type: "ephemeral" }` para reduzir custo em ~90% após o primeiro request.

```ts
// app/lib/claude.ts (esboço)
const systemPrompt = `Você é um classificador de tarefas. Recebe conteúdo bruto e devolve JSON
estritamente no schema abaixo. Critérios:
- priority "alta": prazo nas próximas 24h ou bloqueia outra pessoa.
- priority "media": importante, sem urgência imediata.
- priority "baixa": melhoria, ideia, follow-up sem dono/prazo.
- bucket "hoje": ação concreta para hoje.
- bucket "semana": fazer nesta semana.
- bucket "backlog": importante mas sem data.
- bucket "aguardando": dependente de terceiros (resposta, aprovação, entrega).
Devolva sempre 1 ou mais tarefas. Seja conciso no resumo.`;

const responseSchema = z.object({
  tasks: z.array(z.object({
    title: z.string().min(1).max(120),
    description: z.string().max(500).optional(),
    summary: z.string().max(160),
    priority: z.enum(["alta","media","baixa"]),
    size: z.enum(["P","M","G","GG"]).optional(),
    bucket: z.enum(["hoje","semana","backlog","aguardando"]),
    reasoning: z.string().max(280),
  })).min(1),
});
```

### Multimodal

- **Imagem**: vira `{ type: "image", source: { type: "base64", media_type, data } }` no array de content blocks.
- **Áudio**: Claude não recebe áudio direto. Transcreve antes (decisão MVP: OpenAI Whisper API por simplicidade; alternativa offline: `@xenova/transformers` rodando server-side).
- **Link**: faz fetch server-side, extrai título + descrição/og-tags + (opcional) primeiro parágrafo, e passa como texto.

---

## 8. APIs / Server Actions

```
app/actions/
  auth.ts      → loginWithPassword(formData), logout()
  inputs.ts    → submitInput(formData)            // texto, link
                 uploadFile(formData)             // imagem, áudio
  tasks.ts     → createTaskManual(formData)       // form do form atual
                 updateBucket(id, bucket)
                 updatePriority(id, priority)
                 completeTask(id)
                 deleteTask(id)
                 reorderTasks(bucketId, orderedIds)

app/api/process/route.ts
                → POST: processa input pendente (chamado em background ou via webhook)
```

Toda action começa com `await getServerSession()`-like check (Supabase server client) e usa `revalidateTag('tasks', 'max')` no fim.

---

## 9. Estrutura de componentes React

```
app/
  layout.tsx                 ← root, fonts, metadata
  globals.css                ← tailwind v4 + theme
  page.tsx                   ← MVP: dashboard com 4 colunas + AI input no topo
                                (hoje: form manual de criar task, visual-only)
  (auth)/
    login/page.tsx
  components/
    task-form.tsx            ← form manual (existe — visual)
    ai-input.tsx             ← input principal: textarea + drop zone + paste link
    bucket-column.tsx        ← coluna de tasks (Hoje/Semana/...)
    task-card.tsx            ← card individual com menu de ações
    priority-chip.tsx        ← extraído de task-form quando reaproveitado
    size-chip.tsx
    reasoning-popover.tsx    ← mostra ai_reasoning ao hover/click
    empty-state.tsx
    error-banner.tsx
  lib/
    supabase/server.ts       ← createServerClient (cookies async!)
    supabase/client.ts       ← createBrowserClient
    supabase/middleware.ts   ← refresh de session
    claude.ts                ← wrapper Anthropic SDK + zod schema + cache_control
    transcribe.ts            ← áudio → texto (Whisper)
    extract-link.ts          ← link → texto via fetch + parsing
  actions/
    auth.ts
    inputs.ts
    tasks.ts
  api/
    process/route.ts         ← background processing
middleware.ts                ← protege rotas autenticadas
```

---

## 10. Backlog técnico do MVP (priorizado)

1. ✅ **Form visual de criar task** (esta entrega — `app/page.tsx` + `app/components/task-form.tsx`)
2. Setup Supabase: projeto, vars de env, server/client/middleware clients
3. Auth password: tela `/login`, action `loginWithPassword`, middleware de proteção
4. Migrations: tipos enum + tabelas + RLS + Storage bucket
5. Server Action `createTaskManual` — persiste a task do form atual
6. Dashboard real: `app/page.tsx` vira 4 colunas lendo tasks do Supabase
7. AI input (texto puro): textarea + Server Action → Claude → task
8. Drop de imagem: upload Storage → vision → task
9. Áudio: gravação ou upload → transcrição → Claude → task
10. Mover task entre buckets: drag (`@dnd-kit/core`) ou menu contextual + `useOptimistic`
11. Editar/completar/deletar task
12. Polish: loading skeletons, empty states, error boundaries, view transitions
13. Deploy Vercel + envs de produção

---

## 11. Roadmap pós-MVP (escalabilidade)

- **Fila de processamento**: extrair Claude calls para Inngest ou Supabase Queues — desacopla UI do processamento, permite retry, observabilidade.
- **Embeddings + busca**: `pgvector` para encontrar tasks similares, evitar duplicatas, agrupar contextos.
- **Multiusuário**: workspaces compartilhados, RLS por `workspace_member`.
- **PWA / mobile**: service worker, offline queue, share target (compartilhar do iOS direto pra app).
- **Integrações**: Google Calendar (criar evento de "Hoje"), Slack (capturar mensagens), Linear/Jira.
- **Aprendizado por feedback**: quando usuário move task de bucket, log da correção alimenta few-shot examples no system prompt do Claude.
- **Voz contínua**: long-press para gravar, transcrição streaming, criação imediata.

---

## 12. Convenções de código

- TypeScript strict, sem `any`.
- Server Components por padrão. `'use client'` só quando precisa de estado/efeito/event handlers.
- Server Actions para mutations. Route Handlers só para webhooks ou APIs públicas.
- `useId` para labels acessíveis.
- Sem libs de UI (shadcn etc) por enquanto — Tailwind direto até dor justificar abstração.
- Sem ícones libs até precisar (>3 ícones únicos) — preferir SVG inline ou `lucide-react` quando chegar a hora.
- Comentários só onde o **porquê** não é óbvio. Nomes > comentários.
