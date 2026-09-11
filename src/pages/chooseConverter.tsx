import Elysia, { t } from "elysia";
import { getPossibleTargets } from "../converters/main";
import { getDict, getLocaleFromRequest } from "../i18n";
import { userService } from "./user";

export const chooseConverter = new Elysia().use(userService).post(
  "/conversions",
  ({ body, request, cookie: { lang } }) => {
    const locale = getLocaleFromRequest(request, lang?.value);
    const dict = getDict(locale);

    return (
      <>
        <div
          class={`
            convert_to_popup absolute z-20 mt-2 hidden max-h-[50vh] w-full flex-col overflow-y-auto
            rounded-2xl border border-hairline bg-canvas p-2 shadow-lg
          `}
        >
          {Object.entries(getPossibleTargets(body.fileType)).map(([converter, targets]) => (
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

        <select name="convert_to" aria-label={dict.home.convertTo} required hidden>
          <option selected disabled value="">
            {dict.home.convertTo}
          </option>
          {Object.entries(getPossibleTargets(body.fileType)).map(([converter, targets]) => (
            <optgroup label={converter}>
              {targets.map((target) => (
                <option value={`${target},${converter}`} safe>
                  {target}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </>
    );
  },
  { body: t.Object({ fileType: t.String() }) },
);
