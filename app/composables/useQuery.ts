import type { Log } from "~/plugins/db.client";

/** Generic composable for querying the db with live updates */
export const useQuery = (query: PouchDB.Find.FindRequest<Log>) => {
  const { $db } = useNuxtApp();

  const { data, refresh } = useAsyncData(async () => {
    try {
      return (await $db.find(query)).docs;
    } catch (e) {
      console.error(e);
    }
  });

  // Listen to changes and sync the ref to them
  const changes = $db.changes({ since: "now", live: true }).on("change", () => refresh());
  onUnmounted(() => changes.cancel());

  return { data };
};
