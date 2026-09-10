import Elysia from "elysia";
import { BaseHtml } from "../components/base";
import { Header } from "../components/header";
import { getAllInputs, getAllTargets } from "../converters/main";
import { ALLOW_UNAUTHENTICATED, WEBROOT } from "../helpers/env";
import { getDict, getLocaleFromRequest } from "../i18n";
import { userService } from "./user";

export const listConverters = new Elysia().use(userService).get(
  "/converters",
  async ({ request, cookie: { lang } }) => {
    const locale = getLocaleFromRequest(request, lang?.value);
    const dict = getDict(locale);

    return (
      <BaseHtml webroot={WEBROOT} title={dict.converters.title} locale={locale}>
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
            <article class="article">
              <h1 class="mb-4 text-xl" safe>
                {dict.converters.heading}
              </h1>
              <table
                class={`
                  w-full table-auto rounded-sm bg-neutral-900 text-left
                  [&_td]:p-4
                  [&_tr]:rounded-sm [&_tr]:border-b [&_tr]:border-neutral-800
                  [&_ul]:list-inside [&_ul]:list-disc
                `}
              >
                <thead>
                  <tr>
                    <th class="mx-4 my-2">{dict.converters.converter}</th>
                    <th class="mx-4 my-2">{dict.converters.fromCount}</th>
                    <th class="mx-4 my-2">{dict.converters.toCount}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(getAllTargets()).map(([converter, targets]) => {
                    const inputs = getAllInputs(converter);
                    return (
                      <tr>
                        <td safe>{converter}</td>
                        <td>
                          <span safe>{dict.count}:</span> {inputs.length}
                          <ul>
                            {inputs.map((input) => (
                              <li safe>{input}</li>
                            ))}
                          </ul>
                        </td>
                        <td>
                          <span safe>{dict.count}:</span> {targets.length}
                          <ul>
                            {targets.map((target) => (
                              <li safe>{target}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </article>
          </main>
        </>
      </BaseHtml>
    );
  },
  {
    auth: true,
  },
);
