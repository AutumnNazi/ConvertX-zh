import { randomInt } from "node:crypto";
import { JWTPayloadSpec } from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import { BaseHtml } from "../components/base";
import { Header } from "../components/header";
import { StatusIcon, extensionOf } from "../components/resultRow";
import { getAllTargets } from "../converters/main";
import db from "../db/db";
import { User } from "../db/types";
import {
  ACCOUNT_REGISTRATION,
  ALLOW_UNAUTHENTICATED,
  HIDE_HISTORY,
  HTTP_ALLOWED,
  TIMEZONE,
  UNAUTHENTICATED_USER_SHARING,
  WEBROOT,
} from "../helpers/env";
import { buildDownloadUrl } from "../helpers/buildDownloadUrl";
import { getDict, getLocaleFromRequest, isFailedStatus, translateJobStatus } from "../i18n";
import { FIRST_RUN, userService } from "./user";

const RECENT_LIMIT = 3;

/** 首页「转换结果」里的一条记录 */
type RecentFile = {
  file_name: string;
  output_file_name: string;
  status: string;
  job_id: number;
  date_created: string;
};

const UploadIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 16.5V4.5M12 4.5L7.5 9M12 4.5L16.5 9"
      stroke="var(--accent)"
      stroke-width="1.9"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M4 15.5V17.5C4 19.1569 5.34315 20.5 7 20.5H17C18.6569 20.5 20 19.1569 20 17.5V15.5"
      stroke="var(--accent)"
      stroke-width="1.9"
      stroke-linecap="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
    <path d="M16.5 16.5L20.5 20.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export const root = new Elysia().use(userService).get(
  "/",
  async ({ jwt, redirect, request, cookie: { auth, jobId, lang } }) => {
    const locale = getLocaleFromRequest(request, lang?.value);
    const dict = getDict(locale);

    if (!ALLOW_UNAUTHENTICATED) {
      if (FIRST_RUN) {
        return redirect(`${WEBROOT}/setup`, 302);
      }

      if (!auth?.value) {
        return redirect(`${WEBROOT}/login`, 302);
      }
    }

    // validate jwt
    let user: ({ id: string } & JWTPayloadSpec) | false = false;
    if (ALLOW_UNAUTHENTICATED) {
      const newUserId = String(
        UNAUTHENTICATED_USER_SHARING
          ? 0
          : randomInt(2 ** 24, Math.min(2 ** 48 + 2 ** 24 - 1, Number.MAX_SAFE_INTEGER)),
      );
      const accessToken = await jwt.sign({
        id: newUserId,
      });

      user = { id: newUserId };
      if (!auth) {
        return {
          message: dict.api.noAuthCookie,
        };
      }

      // set cookie
      auth.set({
        value: accessToken,
        httpOnly: true,
        secure: !HTTP_ALLOWED,
        maxAge: 24 * 60 * 60,
        sameSite: "strict",
      });
    } else if (auth?.value) {
      user = await jwt.verify(auth.value);

      if (
        user !== false &&
        user.id &&
        (Number.parseInt(user.id) < 2 ** 24 || !ALLOW_UNAUTHENTICATED)
      ) {
        // Make sure user exists in db
        const existingUser = db.query("SELECT * FROM users WHERE id = ?").as(User).get(user.id);

        if (!existingUser) {
          if (auth?.value) {
            auth.remove();
          }
          return redirect(`${WEBROOT}/login`, 302);
        }
      }
    }

    if (!user) {
      return redirect(`${WEBROOT}/login`, 302);
    }

    // create a new job
    db.query("INSERT INTO jobs (user_id, date_created) VALUES (?, ?)").run(
      user.id,
      new Date().toISOString(),
    );

    const { id } = db
      .query("SELECT id FROM jobs WHERE user_id = ? ORDER BY id DESC")
      .get(user.id) as { id: number };

    if (!jobId) {
      return { message: dict.api.cookiesRequired };
    }

    jobId.set({
      value: id,
      httpOnly: true,
      secure: !HTTP_ALLOWED,
      maxAge: 24 * 60 * 60,
      sameSite: "strict",
    });

    const userId = user.id;

    // 首页「转换结果」：当前用户最近几条转换记录
    const recentFiles = db
      .query(
        `SELECT f.file_name, f.output_file_name, f.status, j.id AS job_id, j.date_created
         FROM file_names f
         JOIN jobs j ON f.job_id = j.id
         WHERE j.user_id = ? AND j.num_files > 0
         ORDER BY j.id DESC, f.id DESC
         LIMIT ?`,
      )
      .all(userId, RECENT_LIMIT) as RecentFile[];

    const formatTime = (iso: string) =>
      new Date(iso).toLocaleString(locale, {
        timeZone: TIMEZONE,
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

    return (
      <BaseHtml webroot={WEBROOT} locale={locale}>
        <>
          <Header
            webroot={WEBROOT}
            accountRegistration={ACCOUNT_REGISTRATION}
            allowUnauthenticated={ALLOW_UNAUTHENTICATED}
            hideHistory={HIDE_HISTORY}
            locale={locale}
            loggedIn
          />
          <main
            class="
              flex w-full flex-1 justify-center px-4 pt-14 pb-18
              sm:px-8
            "
          >
            <div class="flex w-full max-w-[760px] flex-col gap-5">
              <h1 class="m-0 text-[34px] leading-[42px] font-semibold tracking-tight" safe>
                {dict.home.title}
              </h1>
              <p class="m-0 text-[17px] leading-[26px] text-muted" safe>
                {dict.home.subtitle}
              </p>

              <section class="flex flex-col gap-4 card">
                <label
                  id="dropzone"
                  for="file-input"
                  class={`
                    flex h-[164px] cursor-pointer flex-col items-center justify-center gap-1.5
                    rounded-[14px] bg-surface transition-colors
                    hover:bg-soft
                    [&.dragover]:bg-soft
                  `}
                >
                  <UploadIcon />
                  <span class="text-[17px] font-semibold text-accent" safe>
                    {dict.home.chooseFile}
                  </span>
                  <span class="text-sm text-muted" safe>
                    {dict.home.dragHere}
                  </span>
                  <input id="file-input" type="file" name="file" multiple class="sr-only" />
                </label>

                <div
                  id="file-list"
                  class="
                    flex flex-col gap-4
                    empty:hidden
                  "
                />

                <div class="h-px w-full bg-soft" />

                <form
                  method="post"
                  action={`${WEBROOT}/convert`}
                  class="
                    flex flex-col gap-3
                    sm:flex-row sm:items-center
                  "
                >
                  <input type="hidden" name="file_names" id="file_names" />
                  <span class="shrink-0 text-[17px] font-semibold" safe>
                    {dict.home.convertTo}
                  </span>

                  <div class="select_container relative min-w-0 flex-1">
                    <div
                      class={`
                        flex h-[46px] items-center gap-2 rounded-full border border-hairline
                        bg-canvas px-[18px] text-muted transition-colors
                        focus-within:border-accent
                      `}
                    >
                      <SearchIcon />
                      <input
                        type="search"
                        name="convert_to_search"
                        placeholder={dict.home.searchPlaceholder}
                        autocomplete="off"
                        class={`
                          min-w-0 flex-1 bg-transparent text-[17px] text-ink outline-none
                          placeholder:text-muted
                        `}
                      />
                      <ChevronIcon />
                    </div>

                    {/* 上传文件后，/conversions 只会替换这个容器，搜索框本体保持不变 */}
                    <div id="convert_to_targets">
                      <div
                        class={`
                          convert_to_popup absolute z-20 mt-2 hidden max-h-[50vh] w-full flex-col
                          overflow-y-auto rounded-2xl border border-hairline bg-canvas p-2 shadow-lg
                        `}
                      >
                        {Object.entries(getAllTargets()).map(([converter, targets]) => (
                          <div
                            class={`
                              convert_to_group flex w-full flex-col border-b border-hairline p-3
                              last:border-b-0
                            `}
                            data-converter={converter}
                          >
                            <div class="mb-2 w-full text-sm font-bold text-ink" safe>
                              {converter}
                            </div>
                            <div class="convert_to_target flex flex-row flex-wrap gap-1">
                              {targets.map((target) => (
                                <button
                                  // https://stackoverflow.com/questions/121499/when-a-blur-event-occurs-how-can-i-find-out-which-element-focus-went-to#comment82388679_33325953
                                  tabindex={0}
                                  class={`
                                    target cursor-pointer rounded-full bg-surface px-3 py-1 text-sm
                                    text-ink-secondary
                                    hover:bg-accent hover:text-on-accent
                                  `}
                                  data-value={`${target},${converter}`}
                                  data-target={target}
                                  data-converter={converter}
                                  type="button"
                                  safe
                                >
                                  {target}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 决定目标格式与使用的转换器 */}
                      <select name="convert_to" aria-label={dict.home.convertTo} required hidden>
                        <option selected disabled value="">
                          {dict.home.convertTo}
                        </option>
                        {Object.entries(getAllTargets()).map(([converter, targets]) => (
                          <optgroup label={converter}>
                            {targets.map((target) => (
                              <option value={`${target},${converter}`} safe>
                                {target}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button type="submit" class="btn-pill" disabled safe>
                    {dict.home.convert}
                  </button>
                </form>
              </section>

              <section class="flex flex-col gap-0.5 pt-4">
                <div class="flex items-center justify-between">
                  <span class="text-[17px] font-semibold" safe>
                    {dict.home.recentResults}
                  </span>
                  {!HIDE_HISTORY ? (
                    <a class="link" href={`${WEBROOT}/history`} safe>
                      {dict.home.viewAll}
                    </a>
                  ) : null}
                </div>

                {recentFiles.map((file, index) => {
                  const failed = isFailedStatus(file.status);
                  const done = !failed && file.status !== "pending";
                  const sourceExt = extensionOf(file.file_name);
                  const targetExt = extensionOf(file.output_file_name);
                  const outputPath = `${userId}/${file.job_id}/`;

                  return (
                    <>
                      {index > 0 ? <div class="h-px w-full bg-soft" /> : null}
                      <div class="flex items-center justify-between gap-2.5 py-3.5">
                        <div class="flex min-w-0 items-center gap-2.5">
                          <StatusIcon failed={failed} done={done} />
                          <div class="flex min-w-0 flex-col gap-0.5">
                            <span class="truncate text-[15px] font-semibold text-ink" safe>
                              {file.output_file_name}
                            </span>
                            <span class="truncate text-xs text-muted" safe>
                              {`${sourceExt} → ${targetExt} · ${formatTime(file.date_created)} · ${translateJobStatus(dict, file.status)}`}
                            </span>
                          </div>
                        </div>

                        {failed ? (
                          <a class="shrink-0 link" href={`${WEBROOT}/results/${file.job_id}`} safe>
                            {dict.home.viewLog}
                          </a>
                        ) : done ? (
                          <a
                            class="shrink-0 link"
                            href={buildDownloadUrl(WEBROOT, outputPath, file.output_file_name)}
                            download={file.output_file_name}
                            safe
                          >
                            {dict.home.download}
                          </a>
                        ) : (
                          <span class="shrink-0 link link-muted" safe>
                            {dict.home.cancel}
                          </span>
                        )}
                      </div>
                    </>
                  );
                })}

                {recentFiles.length === 0 ? (
                  <p class="m-0 py-3.5 text-sm text-muted" safe>
                    {dict.home.noRecentResults}
                  </p>
                ) : null}
              </section>
            </div>
          </main>
          <script src={`${WEBROOT}/script.js`} defer />
        </>
      </BaseHtml>
    );
  },
  {
    cookie: t.Cookie({
      auth: t.Optional(t.String()),
      jobId: t.Optional(t.String()),
      lang: t.Optional(t.String()),
    }),
  },
);
