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
    <article class="article">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-xl" safe>
          {dict.results.heading}
        </h1>
        <div class="flex flex-row gap-4">
          <form action={`${WEBROOT}/delete/${job.id}`} method="POST">
            <button
              type="submit"
              style={files.length !== job.num_files ? "pointer-events: none;" : ""}
              class="flex btn-secondary flex-row gap-2 text-contrast"
              {...(files.length !== job.num_files ? { disabled: true, "aria-busy": "true" } : "")}
            >
              <DeleteIcon /> <p safe>{dict.results.delete}</p>
            </button>
          </form>
          <a
            style={files.length !== job.num_files ? "pointer-events: none;" : ""}
            href={`${WEBROOT}/archive/${job.id}`}
            download={`converted_files_${job.id}.tar`}
            class="flex btn-primary flex-row gap-2 text-contrast"
            {...(files.length !== job.num_files ? { disabled: true, "aria-busy": "true" } : "")}
          >
            <DownloadIcon /> <p safe>{dict.results.tar}</p>
          </a>
          <button class="flex btn-primary flex-row gap-2 text-contrast" onclick="downloadAll()">
            <DownloadIcon /> <p safe>{dict.results.all}</p>
          </button>
        </div>
      </div>
      <progress
        max={job.num_files}
        {...(files.length === job.num_files ? { value: files.length } : "")}
        class={`
          mb-4 inline-block h-2 w-full appearance-none overflow-hidden rounded-full border-0
          bg-neutral-700 bg-none text-accent-500 accent-accent-500
          [&::-moz-progress-bar]:bg-accent-500
          [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:[background:none]
          [&[value]::-webkit-progress-value]:bg-accent-500
          [&[value]::-webkit-progress-value]:transition-[inline-size]
        `}
      />
      <table
        class={`
          w-full table-auto rounded-sm bg-neutral-900 text-left
          [&_td]:p-4
          [&_tr]:rounded-sm [&_tr]:border-b [&_tr]:border-neutral-800
        `}
      >
        <thead>
          <tr>
            <th
              class={`
                p-2
                sm:px-4
              `}
            >
              {dict.results.convertedFileName}
            </th>
            <th
              class={`
                p-2
                sm:px-4
              `}
            >
              {dict.status}
            </th>
            <th
              class={`
                p-2
                sm:px-4
              `}
            >
              {dict.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const conversionFailed = isFailedStatus(file.status);

            return (
              <tr>
                <td safe class="max-w-[20vw] truncate">
                  {file.output_file_name}
                </td>
                <td safe>{translateJobStatus(dict, file.status)}</td>
                <td class="flex flex-row gap-4">
                  {conversionFailed ? (
                    <span class="text-neutral-500" safe>
                      {dict.unavailable}
                    </span>
                  ) : (
                    <>
                      <a
                        class={`
                          text-accent-500 underline
                          hover:text-accent-400
                        `}
                        href={buildDownloadUrl(WEBROOT, outputPath, file.output_file_name)}
                      >
                        <EyeIcon />
                      </a>
                      <a
                        class={`
                          text-accent-500 underline
                          hover:text-accent-400
                        `}
                        href={buildDownloadUrl(WEBROOT, outputPath, file.output_file_name)}
                        download={file.output_file_name}
                      >
                        <DownloadIcon />
                      </a>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </article>
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
                w-full flex-1 px-2
                sm:px-4
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
