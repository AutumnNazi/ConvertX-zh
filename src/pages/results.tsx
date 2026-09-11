import { Elysia } from "elysia";
import { BaseHtml } from "../components/base";
import { Header } from "../components/header";
import db from "../db/db";
import { Filename, Jobs } from "../db/types";
import { buildDownloadUrl } from "../helpers/buildDownloadUrl";
import { ALLOW_UNAUTHENTICATED, WEBROOT } from "../helpers/env";
import {
  getDict,
  getLocaleFromRequest,
  isFailedStatus,
  translateJobStatus,
  type Dictionary,
} from "../i18n";
import { DownloadIcon } from "../icons/download";
import { DeleteIcon } from "../icons/delete";
import { EyeIcon } from "../icons/eye";
import { StatusIcon, extensionOf } from "../components/resultRow";
import { userService } from "./user";

function ResultsArticle({
  job,
  files,
  outputPath,
  dict,
}: {
  job: Jobs;
  files: Filename[];
  outputPath: string;
  dict: Dictionary;
}) {
  return (
    <section class="mx-auto flex w-full max-w-[760px] flex-col gap-4 card">
      <div class="flex items-center justify-between gap-4">
        <h1 class="m-0 text-[34px] leading-[42px] font-semibold tracking-tight" safe>
          {dict.results.heading}
        </h1>
        <div class="flex flex-row gap-2">
          <form action={`${WEBROOT}/delete/${job.id}`} method="POST">
            <button
              type="submit"
              style={files.length !== job.num_files ? "pointer-events: none;" : ""}
              class="flex btn-secondary flex-row items-center gap-2 px-4 py-2 text-sm"
              {...(files.length !== job.num_files ? { disabled: true, "aria-busy": "true" } : "")}
            >
              <DeleteIcon /> <span safe>{dict.results.delete}</span>
            </button>
          </form>
          <a
            style={files.length !== job.num_files ? "pointer-events: none;" : ""}
            href={`${WEBROOT}/archive/${job.id}`}
            download={`converted_files_${job.id}.tar`}
            class="flex btn-secondary flex-row items-center gap-2 px-4 py-2 text-sm"
            {...(files.length !== job.num_files ? { disabled: true, "aria-busy": "true" } : "")}
          >
            <DownloadIcon /> <span safe>{dict.results.tar}</span>
          </a>
          <button class="btn-pill h-[38px] px-5 text-sm" onclick="downloadAll()">
            <span safe>{dict.results.all}</span>
          </button>
        </div>
      </div>

      <progress
        max={job.num_files}
        {...(files.length === job.num_files ? { value: files.length } : "")}
        class={`
          inline-block h-1 w-full appearance-none overflow-hidden rounded-full border-0 bg-soft
          bg-none text-accent accent-accent
          [&::-moz-progress-bar]:bg-accent
          [&::-webkit-progress-bar]:bg-soft
          [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-accent
          [&[value]::-webkit-progress-value]:transition-[inline-size]
        `}
      />

      <div class="flex flex-col">
        {files.map((file, index) => {
          const conversionFailed = isFailedStatus(file.status);
          const done = !conversionFailed && file.status !== "pending";
          const sourceExt = extensionOf(file.file_name);
          const targetExt = extensionOf(file.output_file_name);

          return (
            <>
              {index > 0 ? <div class="h-px w-full bg-soft" /> : null}
              <div class="flex items-center justify-between gap-2.5 py-3.5">
                <div class="flex min-w-0 items-center gap-2.5">
                  <StatusIcon failed={conversionFailed} done={done} />
                  <div class="flex min-w-0 flex-col gap-0.5">
                    <span class="truncate text-[15px] font-semibold text-ink" safe>
                      {file.output_file_name}
                    </span>
                    <span class="truncate text-xs text-muted" safe>
                      {`${sourceExt} → ${targetExt} · ${translateJobStatus(dict, file.status)}`}
                    </span>
                  </div>
                </div>

                {conversionFailed ? (
                  <span class="text-sm text-muted" safe>
                    {dict.unavailable}
                  </span>
                ) : (
                  <div class="flex shrink-0 items-center gap-4">
                    <a
                      class={`
                        text-accent
                        hover:text-accent-hover
                      `}
                      href={buildDownloadUrl(WEBROOT, outputPath, file.output_file_name)}
                      title={file.output_file_name}
                    >
                      <EyeIcon />
                    </a>
                    <a
                      class={`
                        text-accent
                        hover:text-accent-hover
                      `}
                      href={buildDownloadUrl(WEBROOT, outputPath, file.output_file_name)}
                      download={file.output_file_name}
                    >
                      <DownloadIcon />
                    </a>
                  </div>
                )}
              </div>
            </>
          );
        })}
      </div>
    </section>
  );
}

export const results = new Elysia()
  .use(userService)
  .get(
    "/results/:jobId",
    async ({ params, set, request, cookie: { job_id, lang }, user }) => {
      if (job_id?.value) {
        // Clear the job_id cookie since we are viewing the results
        job_id.remove();
      }

      const locale = getLocaleFromRequest(request, lang?.value);
      const dict = getDict(locale);

      const job = db
        .query("SELECT * FROM jobs WHERE user_id = ? AND id = ?")
        .as(Jobs)
        .get(user.id, params.jobId);

      if (!job) {
        set.status = 404;
        return {
          message: dict.api.jobNotFound,
        };
      }

      const outputPath = `${user.id}/${params.jobId}/`;

      const files = db
        .query("SELECT * FROM file_names WHERE job_id = ?")
        .as(Filename)
        .all(params.jobId);

      return (
        <BaseHtml webroot={WEBROOT} title={dict.results.title} locale={locale}>
          <>
            <Header
              webroot={WEBROOT}
              allowUnauthenticated={ALLOW_UNAUTHENTICATED}
              locale={locale}
              loggedIn
            />
            <main
              class={`
                flex w-full flex-1 justify-center px-4 pt-14 pb-18
                sm:px-8
              `}
            >
              <ResultsArticle job={job} files={files} outputPath={outputPath} dict={dict} />
            </main>
            <script src={`${WEBROOT}/results.js`} defer />
          </>
        </BaseHtml>
      );
    },
    { auth: true },
  )
  .post(
    "/progress/:jobId",
    async ({ set, params, request, cookie: { job_id, lang }, user }) => {
      if (job_id?.value) {
        // Clear the job_id cookie since we are viewing the results
        job_id.remove();
      }

      const locale = getLocaleFromRequest(request, lang?.value);
      const dict = getDict(locale);

      const job = db
        .query("SELECT * FROM jobs WHERE user_id = ? AND id = ?")
        .as(Jobs)
        .get(user.id, params.jobId);

      if (!job) {
        set.status = 404;
        return {
          message: dict.api.jobNotFound,
        };
      }

      const outputPath = `${user.id}/${params.jobId}/`;

      const files = db
        .query("SELECT * FROM file_names WHERE job_id = ?")
        .as(Filename)
        .all(params.jobId);

      return <ResultsArticle job={job} files={files} outputPath={outputPath} dict={dict} />;
    },
    { auth: true },
  );
