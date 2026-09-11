import { version } from "../../package.json";
import { getDict, type Locale } from "../i18n";

/** 页脚中展示的底层转换器 */
const CONVERTERS = [
  { name: "FFmpeg", url: "https://ffmpeg.org/" },
  { name: "ImageMagick", url: "https://imagemagick.org/" },
  { name: "LibreOffice", url: "https://www.libreoffice.org/" },
  { name: "Pandoc", url: "https://pandoc.org/" },
  { name: "Calibre", url: "https://calibre-ebook.com/" },
];

/** 序列化为可直接嵌入 <script> 的 JSON，避免 `</script>` 提前闭合标签 */
const jsonForScript = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

/** 在首屏绘制前应用主题，避免闪白 / 闪黑 */
const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem("convertx-theme");
    if (saved === "dark" || saved === "light") {
      document.documentElement.dataset.theme = saved;
    }
  } catch (e) {}

  document.addEventListener("click", function (event) {
    var toggle = event.target.closest("[data-theme-toggle]");
    if (toggle) {
      var root = document.documentElement;
      var isDark = root.dataset.theme
        ? root.dataset.theme === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      var next = isDark ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem("convertx-theme", next);
      } catch (e) {}
      return;
    }

    // 点击外部关闭语言下拉
    document.querySelectorAll("details.lang-switcher[open]").forEach(function (el) {
      if (!el.contains(event.target)) el.removeAttribute("open");
    });
  });
})();
`;

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
        {/* 注意：@kitajs/html 的 safe 属性是「转义」而非「不转义」，脚本内容绝不能加 safe */}
        <script>{`window.__I18N__=${jsonForScript({
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
        <script>{themeInitScript}</script>
        <title safe>{resolvedTitle}</title>
        <link rel="stylesheet" href={`${webroot}/generated.css`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${webroot}/apple-touch-icon.png`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${webroot}/favicon-32x32.png`} />
        <link rel="icon" type="image/png" sizes="16x16" href={`${webroot}/favicon-16x16.png`} />
        <link rel="manifest" href={`${webroot}/site.webmanifest`} />
      </head>
      <body class="flex min-h-screen w-full flex-col bg-canvas font-sans text-ink">
        {children}
        <footer class="mt-auto w-full border-t border-hairline bg-surface px-8 py-[22px]">
          <div class="mx-auto flex max-w-[1440px] flex-col items-center gap-2.5">
            <span class="text-xs text-muted" safe>
              {dict.poweredBy}
            </span>
            <div
              class="
                flex flex-wrap items-center justify-center gap-4
                sm:gap-5
              "
            >
              {CONVERTERS.map((converter) => (
                <a
                  class={`
                    text-xs text-accent no-underline
                    hover:underline
                  `}
                  href={converter.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {converter.name}
                </a>
              ))}
              <a
                class={`
                  text-xs text-accent no-underline
                  hover:underline
                `}
                href="https://github.com/C4illin/ConvertX"
                target="_blank"
                rel="noreferrer noopener"
              >
                ConvertX v{version || ""}
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
};
