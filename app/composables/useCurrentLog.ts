import { DateTime } from "luxon";

export type CurrentLog = { startedAt: string; customerName?: string; projectName?: string; location?: string };
export const useCurrentLog = () => {
  const localStorageKey = "currentLog";
  const currentLog = ref<CurrentLog | undefined>();

  onBeforeMount(() => {
    const log = localStorage.getItem(localStorageKey);
    if (log == null) {
      currentLog.value = undefined;
      return;
    }

    let parsedLog: unknown;
    try {
      parsedLog = JSON.parse(log);
    } catch {
      currentLog.value = undefined;
      localStorage.removeItem(localStorageKey);
    }

    if (
      !!parsedLog &&
      typeof parsedLog === "object" &&
      "startedAt" in parsedLog &&
      typeof parsedLog.startedAt === "string" &&
      DateTime.fromISO(parsedLog.startedAt).isValid
    ) {
      const validatedLog: CurrentLog = { startedAt: parsedLog.startedAt };
      if (
        "customerName" in parsedLog &&
        typeof parsedLog.customerName === "string" &&
        parsedLog.customerName.length > 0
      ) {
        validatedLog.customerName = parsedLog.customerName;
      }

      if ("projectName" in parsedLog && typeof parsedLog.projectName === "string" && parsedLog.projectName.length > 0) {
        validatedLog.projectName = parsedLog.projectName;
      }

      if ("location" in parsedLog && typeof parsedLog.location === "string" && parsedLog.location.length > 0) {
        validatedLog.location = parsedLog.location;
      }

      currentLog.value = validatedLog;
    }
  });

  watch(
    currentLog,
    (log) => {
      if (log == undefined) localStorage.removeItem(localStorageKey);
      else localStorage.setItem(localStorageKey, JSON.stringify(log));
    },
    { deep: true },
  );

  return currentLog;
};
