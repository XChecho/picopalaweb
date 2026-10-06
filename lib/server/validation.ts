export type TValidation<T> = { ok: true; value: T } | { ok: false; message: string[] };

export interface ILoginInput {
  username: string;
  password: string;
}

export interface IRegisterInput {
  username: string;
  email: string;
  password: string;
  language?: "en" | "es" | "pt";
}

const USERNAME_PATTERN = /^[A-Za-z0-9]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LANGUAGES = ["en", "es", "pt"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return isRecord(body) ? body : null;
  } catch {
    return null;
  }
}

export function validateLogin(body: Record<string, unknown> | null): TValidation<ILoginInput> {
  const errors: string[] = [];
  const username = body?.username;
  const password = body?.password;

  if (typeof username !== "string" || username.length === 0 || username.length > 254) {
    errors.push("username must be a non-empty string");
  }
  if (typeof password !== "string" || password.length === 0 || password.length > 128) {
    errors.push("password must be a non-empty string");
  }
  if (errors.length > 0 || typeof username !== "string" || typeof password !== "string") {
    return { ok: false, message: errors.length > 0 ? errors : ["Invalid request body"] };
  }
  return { ok: true, value: { username, password } };
}

export function validateRegister(body: Record<string, unknown> | null): TValidation<IRegisterInput> {
  const errors: string[] = [];
  const username = body?.username;
  const email = body?.email;
  const password = body?.password;
  const language = body?.language;

  if (typeof username !== "string" || !USERNAME_PATTERN.test(username)) {
    errors.push("username must be 3-20 alphanumeric characters");
  }
  if (typeof email !== "string" || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.push("email must be a valid email address");
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 72) {
    errors.push("password must be between 8 and 72 characters");
  }
  const parsedLanguage = LANGUAGES.find((l) => l === language);
  if (language !== undefined && !parsedLanguage) {
    errors.push("language must be one of en, es, pt");
  }

  if (
    errors.length > 0 ||
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return { ok: false, message: errors.length > 0 ? errors : ["Invalid request body"] };
  }
  return { ok: true, value: { username, email, password, language: parsedLanguage } };
}
