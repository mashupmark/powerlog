import type { Log } from "~/plugins/db.client";

export const useDB = () => {
  const { $db } = useNuxtApp();

  const { data, execute } = useAsyncData(async () => {
    return (await $db.allDocs({ include_docs: true })).rows.map((r) => r.doc);
  });

  // Listen to changes and sync the ref to them
  const changes = $db.changes({ since: "now", live: true }).on("change", () => execute());
  onUnmounted(() => changes.cancel());

  const addLog = async (log: Log) => {
    await $db.post(log);
  };

  return { data, addLog };
};
