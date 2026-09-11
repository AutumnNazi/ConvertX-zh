import { availableLocales, getDict, getLocaleLabel, type Locale } from "../i18n";

/** 品牌图标：文档 + 蓝色对勾 */
const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M16.5 20.5H6.5C5.67157 20.5 5 19.8284 5 19V5C5 4.17157 5.67157 3.5 6.5 3.5H14.5L19 8V19C19 19.8284 18.3284 20.5 17.5 20.5H16.5"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linejoin="round"
    />
    <path d="M14.5 3.5V8H19" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
    <path
      d="M13 12.5L15.5 15.5L21 9.5"
      stroke="var(--accent)"
      stroke-width="1.9"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
    <path d="M3.4 9.5H20.6M3.4 14.5H20.6" stroke="currentColor" stroke-width="1.6" />
    <ellipse cx="12" cy="12" rx="4.2" ry="9" stroke="currentColor" stroke-width="1.6" />
  </svg>
);

const SunIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    class="theme-icon-sun"
  >
    <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8" />
    <path
      d="M12 3V5.5M12 18.5V21M3 12H5.5M18.5 12H21M5.6 5.6L7.4 7.4M16.6 16.6L18.4 18.4M18.4 5.6L16.6 7.4M7.4 16.6L5.6 18.4"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    class="theme-icon-moon"
  >
    <path
      d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const navLinkClass = `
  text-sm text-ink-secondary no-underline transition-colors
  hover:text-accent
`;

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

  let rightNav: JSX.Element;
  if (loggedIn) {
    rightNav = (
      <>
        {!hideHistory ? (
          <a class={navLinkClass} href={`${webroot}/history`}>
            {dict.nav.history}
          </a>
        ) : null}
        <a class={navLinkClass} href={`${webroot}/converters`}>
          {dict.nav.converters}
        </a>
        {!allowUnauthenticated ? (
          <a class={navLinkClass} href={`${webroot}/account`}>
            {dict.nav.account}
          </a>
        ) : null}
        {!allowUnauthenticated ? (
          <a class={navLinkClass} href={`${webroot}/logoff`}>
            {dict.nav.logout}
          </a>
        ) : null}
      </>
    );
  } else {
    rightNav = (
      <>
        <a class={navLinkClass} href={`${webroot}/login`}>
          {dict.nav.login}
        </a>
        {accountRegistration ? (
          <a class={navLinkClass} href={`${webroot}/register`}>
            {dict.nav.register}
          </a>
        ) : null}
      </>
    );
  }

  return (
    <header class="sticky top-0 z-20 w-full border-b border-hairline bg-canvas">
      <div class="
        mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4
        sm:px-8
      ">
        <a href={`${webroot}/`} class="flex items-center gap-2 text-ink no-underline">
          <LogoIcon />
          <span class="text-[19px] font-semibold tracking-tight">{dict.brand}</span>
        </a>

        <nav class="
          flex items-center gap-4
          sm:gap-6
        ">
          {rightNav}
          <LanguageSwitcher webroot={webroot} locale={locale} />
          <button
            type="button"
            class={`
              grid size-[30px] shrink-0 cursor-pointer place-items-center rounded-full bg-surface
              text-ink-secondary transition-colors
              hover:bg-soft
            `}
            data-theme-toggle
            title={dict.nav.theme}
            aria-label={dict.nav.theme}
          >
            <SunIcon />
            <MoonIcon />
          </button>
        </nav>
      </div>
    </header>
  );
};

const LanguageSwitcher = ({ webroot, locale }: { webroot: string; locale: Locale }) => (
  <details class="lang-switcher relative">
    <summary
      class={`
        inline-flex h-[30px] cursor-pointer list-none items-center gap-1.5 rounded-full bg-surface
        px-3 text-xs text-ink-secondary
        [&::-webkit-details-marker]:hidden
      `}
      aria-label={getDict(locale).nav.language}
    >
      <GlobeIcon />
      <span safe>{getLocaleLabel(locale)}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 9L12 15L18 9"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </summary>
    <div
      class={`
        absolute right-0 z-30 mt-2 flex min-w-[120px] flex-col overflow-hidden rounded-xl border
        border-hairline bg-canvas py-1 shadow-lg
      `}
    >
      {availableLocales.map((code) => (
        <a
          class={`
            px-3 py-1.5 text-xs no-underline transition-colors
            ${code === locale ? "font-semibold text-accent" : `
              text-ink-secondary
              hover:bg-surface
            `}
          `}
          href={`${webroot}/lang/${code}`}
          hreflang={code}
          aria-current={code === locale ? "true" : undefined}
        >
          {getLocaleLabel(code)}
        </a>
      ))}
    </div>
  </details>
);
