/** 转换结果行的状态图标，与首页「转换结果」和结果页共用 */

export const extensionOf = (fileName: string) => {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.pop() as string).toUpperCase() : "?";
};

export const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
    <path
      d="M8 12.4L10.9 15.2L16.2 9.6"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
    <path
      d="M12 7.5V12L15.5 14"
      stroke="currentColor"
      stroke-width="1.9"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
    <path d="M12 7.5V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <path d="M12 16.4V16.6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
  </svg>
);

export const StatusIcon = ({ failed, done }: { failed: boolean; done: boolean }) => {
  if (failed) {
    return (
      <span class="shrink-0 text-ink">
        <AlertIcon />
      </span>
    );
  }

  if (done) {
    return (
      <span class="shrink-0 text-ink">
        <CheckIcon />
      </span>
    );
  }

  return (
    <span class="shrink-0 text-muted">
      <ClockIcon />
    </span>
  );
};
