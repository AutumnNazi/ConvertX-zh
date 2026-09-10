import { Elysia } from "elysia";
import { HTTP_ALLOWED, LANGUAGE, WEBROOT } from "../helpers/env";
import { en, type Dictionary } from "./en";
import { zhCN } from "./zh-CN";

export type { Dictionary };

/** Read a language cookie value if present. */
function readLangCookie(cookieLang: unknown): string | undefined {
  if (typeof cookieLang === "string" && cookieLang) return cookieLang;
  if (
    cookieLang &&
    typeof cookieLang === "object" &&
    "value" in cookieLang &&
    typeof (cookieLang as { value?: unknown }).value === "string"
  ) {
    const value = (cookieLang as { value?: string }).value;
    return value || undefined;
  }
  return undefined;
}

const dictionaries = {
  en,
  "zh-CN": zhCN,
};

export type Locale = keyof typeof dictionaries;

const DEFAULT_LOCALE: Locale = "en";

export const availableLocales = Object.keys(dictionaries) as Locale[];

const localeLabels: Record<Locale, string> = {
  en: "English",
  "zh-CN": "中文",
};

export function getLocaleLabel(locale: Locale): string {
  return localeLabels[locale];
}

function normalizeLocale(raw: string): Locale | null {
  const tag = raw.trim().toLowerCase();
  if (!tag) return null;
  if (tag in dictionaries) return tag as Locale;
  if (tag.startsWith("zh")) return "zh-CN";
  if (tag.startsWith("en")) return "en";
  return null;
}

function matchAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;

  const candidates = header
    .split(",")
    .map((part) => {
      const [tagPart, ...params] = part.trim().split(";");
      const tag = (tagPart ?? "").trim();
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const quality = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return { tag, quality: Number.isNaN(quality) ? 0 : quality };
    })
    .filter((c) => c.tag)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of candidates) {
    if (tag === "*") return null;
    const normalized = normalizeLocale(tag);
    if (normalized) return normalized;
  }
  return null;
}

export function resolveLocale(
  acceptLanguage: string | null | undefined,
  cookieLang?: string | null,
): Locale {
  const fromCookie = cookieLang ? normalizeLocale(cookieLang) : null;
  if (fromCookie) return fromCookie;

  const fromAccept = matchAcceptLanguage(acceptLanguage);
  if (fromAccept) return fromAccept;

  const fromEnv = LANGUAGE ? normalizeLocale(LANGUAGE) : null;
  if (fromEnv) return fromEnv;

  return DEFAULT_LOCALE;
}

export function getDict(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function getLocaleFromRequest(request: Request, cookieLang?: unknown): Locale {
  return resolveLocale(request.headers.get("accept-language"), readLangCookie(cookieLang));
}

/** Translate a conversion job status stored in the database (English canonical values). */
export function translateJobStatus(dict: Dictionary, status: string): string {
  switch (status) {
    case "Done":
      return dict.jobStatus.done;
    case "Failed, check logs":
      return dict.jobStatus.failed;
    case "File type not supported":
      return dict.jobStatus.unsupported;
    case "pending":
      return dict.jobStatus.pending;
    case "completed":
      return dict.jobStatus.completed;
    default:
      return status;
  }
}

export function isFailedStatus(status: string): boolean {
  return status === "Failed, check logs" || status === "File type not supported";
}

function isSupportedLocale(code: string): code is Locale {
  return code in dictionaries;
}

/** Sets the `lang` cookie and redirects back to the previous page. */
export const localePlugin = new Elysia({ name: "locale" }).get(
  "/lang/:code",
  ({ params, request, cookie, redirect }) => {
    const code = params.code;
    if (!isSupportedLocale(code)) {
      return redirect(`${WEBROOT}/`, 302);
    }

    cookie.lang?.set({
      value: code,
      httpOnly: true,
      secure: !HTTP_ALLOWED,
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "strict",
      path: "/",
    });

    const referer = request.headers.get("referer");
    let back = `${WEBROOT}/`;
    if (referer) {
      try {
        const url = new URL(referer);
        // Stay on same origin; strip a previous /lang/... path segment if present
        const alreadyLang = /\/lang\/[^/]+/.test(url.pathname);
        if (alreadyLang) {
          back = url.origin + url.pathname.replace(/\/lang\/[^/]+/, "") + url.search;
        } else if (url.origin === new URL(request.url).origin) {
          back = referer;
        }
      } catch {
        // fall through to home
      }
    }

    return redirect(back, 302);
  },
);
