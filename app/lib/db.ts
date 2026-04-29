import "server-only";

import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

export type Priority = "alta" | "media" | "baixa";
export type Size = "P" | "M" | "G" | "GG";

export type TaskRow = {
  id: number;
  user_name: string;
  description: string;
  priority: Priority;
  size: Size;
  created_at: string;
};

const dataDir = path.join(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "app.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name   TEXT NOT NULL DEFAULT '_legacy_',
    description TEXT NOT NULL,
    priority    TEXT NOT NULL CHECK(priority IN ('alta','media','baixa')),
    size        TEXT NOT NULL CHECK(size IN ('P','M','G','GG')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const columnInfo = db
  .prepare<[], { name: string }>(
    "SELECT name FROM pragma_table_info('tasks') WHERE name = 'user_name'",
  )
  .get();
if (!columnInfo) {
  db.exec(
    "ALTER TABLE tasks ADD COLUMN user_name TEXT NOT NULL DEFAULT '_legacy_'",
  );
}

db.exec("CREATE INDEX IF NOT EXISTS idx_tasks_user_name ON tasks(user_name)");

const insertTask = db.prepare<[string, string, Priority, Size], TaskRow>(
  "INSERT INTO tasks (user_name, description, priority, size) VALUES (?, ?, ?, ?) RETURNING *",
);

const selectTasksByUser = db.prepare<[string], TaskRow>(
  "SELECT * FROM tasks WHERE user_name = ? ORDER BY id DESC",
);

const selectAllTasks = db.prepare<[], TaskRow>(
  "SELECT * FROM tasks ORDER BY user_name, id DESC",
);

export function createTask(input: {
  userName: string;
  description: string;
  priority: Priority;
  size: Size;
}): TaskRow {
  const row = insertTask.get(
    input.userName,
    input.description,
    input.priority,
    input.size,
  );
  if (!row) throw new Error("Falha ao inserir tarefa");
  return row;
}

export function listTasksByUser(userName: string): TaskRow[] {
  return selectTasksByUser.all(userName);
}

export function listAllTasks(): TaskRow[] {
  return selectAllTasks.all();
}
