import { eq, or } from "drizzle-orm";

import { getDb } from "@/db/client";
import { accounts } from "@/db/schema";

const DEFAULT_USER_ROLE = "user";
const DEFAULT_ACCOUNT_STATUS = "active";

type AccountRecord = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  roleType: string;
  accountStatus: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string) {
  return username.trim();
}

function normalizeIdentifier(identifier: string) {
  const trimmed = identifier.trim();

  if (trimmed.includes("@")) {
    return {
      kind: "email" as const,
      value: normalizeEmail(trimmed)
    };
  }

  return {
    kind: "username" as const,
    value: normalizeUsername(trimmed)
  };
}

export type CreateUserAccountInput = {
  email: string;
  username: string;
  passwordHash: string;
};

export function sanitizeEmail(email: string) {
  return normalizeEmail(email);
}

export function sanitizeUsername(username: string) {
  return normalizeUsername(username);
}

export function sanitizeIdentifier(identifier: string) {
  return normalizeIdentifier(identifier);
}

export async function findAccountByIdentifier(identifier: string) {
  const normalized = normalizeIdentifier(identifier);
  const db = getDb();

  const rows = await db
    .select({
      id: accounts.id,
      email: accounts.email,
      username: accounts.username,
      passwordHash: accounts.passwordHash,
      roleType: accounts.roleType,
      accountStatus: accounts.accountStatus
    })
    .from(accounts)
    .where(
      normalized.kind === "email"
        ? eq(accounts.email, normalized.value)
        : eq(accounts.username, normalized.value)
    )
    .limit(1);

  return rows[0] satisfies AccountRecord | undefined;
}

export async function findExistingAccounts(email: string, username: string) {
  const db = getDb();

  return db
    .select({
      email: accounts.email,
      username: accounts.username
    })
    .from(accounts)
    .where(
      or(eq(accounts.email, normalizeEmail(email)), eq(accounts.username, normalizeUsername(username)))
    );
}

export async function createUserAccount(input: CreateUserAccountInput) {
  const db = getDb();
  const inserted = await db
    .insert(accounts)
    .values({
      email: normalizeEmail(input.email),
      username: normalizeUsername(input.username),
      passwordHash: input.passwordHash,
      roleType: DEFAULT_USER_ROLE,
      accountStatus: DEFAULT_ACCOUNT_STATUS
    })
    .returning({
      id: accounts.id
    });

  return inserted[0] ?? null;
}

export const ACCOUNT_STATUS_ASSUMPTION = DEFAULT_ACCOUNT_STATUS;
