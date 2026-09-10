import { version } from "../../package.json";
import { getDict, type Locale } from "../i18n";

export const BaseHtml = ({
  children,
  title,
  webroot = "",
  locale = "en",
}: {
  children: JSX.Element | JSX.Element[];
  title?: string;
  webroot?: string;
  locale?: Locale;
}) => {
  const dict = getDict(locale);
  const resolvedTitle = title ?? dict.brand;

  return (
    <html lang={locale}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="webroot" content={webroot} />
        <script safe>{`window.__I18N__=${JSON.stringify({
          remove: dict.client.remove,
          uploading: dict.client.uploading,
          convert: dict.client.convert,
          convertTitle: dict.client.convertTitle,
          usingFormat: dict.client.usingFormat,
          confirmDeleteJobs: dict.client.confirmDeleteJobs,
          deleteSuccess: dict.client.deleteSuccess,
          deletePartialFailed: dict.client.deletePartialFailed,
          deleteFailed: dict.client.deleteFailed,
          deleteError: dict.client.deleteError,
        })};`}</script>
        <title safe>{resolvedTitle}</title>
        <link rel="stylesheet" href={`${webroot}/generated.css`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${webroot}/apple-touch-icon.png`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${webroot}/favicon-32x32.png`} />
        <link rel="icon" type="image/png" sizes="16x16" href={`${webroot}/favicon-16x16.png`} />
        <link rel="manifest" href={`${webroot}/site.webmanifest`} />
      </head>
      <body class={`flex min-h-screen w-full flex-col bg-neutral-900 text-neutral-200`}>
        {children}
        <footer class="w-full">
          <div class="p-4 text-center text-sm text-neutral-500">
            <span safe>{dict.poweredBy} </span>
            <a
              href="https://github.com/C4illin/ConvertX"
              class={`
                text-neutral-400
                hover:text-accent-500
              `}
            >
              ConvertX{" "}
            </a>
            <span safe>v{version || ""}</span>
          </div>
        </footer>
      </body>
    </html>
  );
};
