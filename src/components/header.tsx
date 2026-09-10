import { availableLocales, getDict, getLocaleLabel, type Locale } from "../i18n";

export const Header = ({
  loggedIn,
  accountRegistration,
  allowUnauthenticated,
  hideHistory,
  webroot = "",
  locale = "en",
}: {
  loggedIn?: boolean;
  accountRegistration?: boolean;
  allowUnauthenticated?: boolean;
  hideHistory?: boolean;
  webroot?: string;
  locale?: Locale;
}) => {
  const dict = getDict(locale);
  const linkClass = `
    text-accent-600 transition-all
    hover:text-accent-500 hover:underline
  `;

  let rightNav: JSX.Element;
  if (loggedIn) {
    rightNav = (
      <ul class="flex flex-wrap items-center gap-4">
        {!hideHistory && (
          <li>
            <a class={linkClass} href={`${webroot}/history`}>
              {dict.nav.history}
            </a>
          </li>
        )}
        {!allowUnauthenticated ? (
          <li>
            <a class={linkClass} href={`${webroot}/account`}>
              {dict.nav.account}
            </a>
          </li>
        ) : null}
        {!allowUnauthenticated ? (
          <li>
            <a class={linkClass} href={`${webroot}/logoff`}>
              {dict.nav.logout}
            </a>
          </li>
        ) : null}
        <li>
          <LanguageSwitcher webroot={webroot} locale={locale} />
        </li>
      </ul>
    );
  } else {
    rightNav = (
      <ul class="flex flex-wrap items-center gap-4">
        <li>
          <a class={linkClass} href={`${webroot}/login`}>
            {dict.nav.login}
          </a>
        </li>
        {accountRegistration ? (
          <li>
            <a class={linkClass} href={`${webroot}/register`}>
              {dict.nav.register}
            </a>
          </li>
        ) : null}
        <li>
          <LanguageSwitcher webroot={webroot} locale={locale} />
        </li>
      </ul>
    );
  }

  return (
    <header class="w-full p-4">
      <nav class={`mx-auto flex max-w-4xl justify-between rounded-sm bg-neutral-900 p-4`}>
        <ul>
          <li>
            <strong>
              <a href={`${webroot}/`}>{dict.brand}</a>
            </strong>
          </li>
        </ul>
        {rightNav}
      </nav>
    </header>
  );
};

const LanguageSwitcher = ({ webroot, locale }: { webroot: string; locale: Locale }) => (
  <span class="flex items-center gap-2" aria-label={getDict(locale).nav.language}>
    {availableLocales.map((code, index) => (
      <>
        {index > 0 ? (
          <span class="text-neutral-600" aria-hidden="true">
            |
          </span>
        ) : null}
        <a
          class={`
            text-sm transition-all
            ${
              code === locale
                ? "font-semibold text-accent-500"
                : `
                  text-accent-600
                  hover:text-accent-500 hover:underline
                `
            }
          `}
          href={`${webroot}/lang/${code}`}
          hreflang={code}
          aria-current={code === locale ? "true" : undefined}
        >
          {getLocaleLabel(code)}
        </a>
      </>
    ))}
  </span>
);
