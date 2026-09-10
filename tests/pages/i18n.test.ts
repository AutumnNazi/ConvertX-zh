import { describe, expect, test } from "bun:test";
import {
  availableLocales,
  getDict,
  isFailedStatus,
  resolveLocale,
  translateJobStatus,
} from "../../src/i18n";

describe("i18n locale resolution", () => {
  test("prefers cookie language over Accept-Language", () => {
    expect(resolveLocale("en-US,en;q=0.9", "zh-CN")).toBe("zh-CN");
    expect(resolveLocale("zh-CN,zh;q=0.9", "en")).toBe("en");
  });

  test("matches Accept-Language tags", () => {
    expect(resolveLocale("zh-CN,zh;q=0.9,en;q=0.8")).toBe("zh-CN");
    expect(resolveLocale("en-US,en;q=0.9")).toBe("en");
    expect(resolveLocale("zh")).toBe("zh-CN");
    expect(resolveLocale("en")).toBe("en");
  });

  test("falls back to default when no match", () => {
    expect(resolveLocale(null, null)).toBe("en");
    expect(resolveLocale("fr-FR,fr;q=0.9", null)).toBe("en");
  });
});

describe("i18n dictionaries", () => {
  test("exposes en and zh-CN", () => {
    expect(availableLocales).toEqual(["en", "zh-CN"]);
  });

  test("zh-CN has translations for key UI strings", () => {
    const zh = getDict("zh-CN");
    expect(zh.home.convert).toBe("转换");
    expect(zh.nav.login).toBe("登录");
    expect(zh.nav.history).toBe("历史记录");
    expect(zh.jobStatus.done).toBe("完成");
  });

  test("en keeps original strings", () => {
    const en = getDict("en");
    expect(en.home.convert).toBe("Convert");
    expect(en.nav.login).toBe("Login");
    expect(en.jobStatus.failed).toBe("Failed, check logs");
  });
});

describe("job status translation", () => {
  test("maps stored English statuses", () => {
    const zh = getDict("zh-CN");
    expect(translateJobStatus(zh, "Done")).toBe("完成");
    expect(translateJobStatus(zh, "Failed, check logs")).toBe("失败，请查看日志");
    expect(translateJobStatus(zh, "File type not supported")).toBe("不支持的文件类型");
    expect(translateJobStatus(zh, "pending")).toBe("等待中");
    expect(translateJobStatus(zh, "completed")).toBe("已完成");
    expect(translateJobStatus(zh, "custom-status")).toBe("custom-status");
  });

  test("detects failed statuses", () => {
    expect(isFailedStatus("Failed, check logs")).toBe(true);
    expect(isFailedStatus("File type not supported")).toBe(true);
    expect(isFailedStatus("Done")).toBe(false);
  });
});
