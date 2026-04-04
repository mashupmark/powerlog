import PouchDB from "pouchdb";
import PouchDBFindPlugin from "pouchdb-find";

/** Type of the entries stored within the db */
export type Log = {
  startedAt: string;
  stoppedAt: string;
  customerName?: string;
  projectName?: string;
};

export default defineNuxtPlugin(async () => {
  PouchDB.plugin(PouchDBFindPlugin);
  const db = new PouchDB<Log>("logs", { auto_compaction: true });

  // Sync the local db to the remote one proxied through the "/db" route
  const remoteDBUrl = new URL("/db/logs", window.location.origin).toString();
  db.sync(remoteDBUrl, { live: true, retry: true });

  const queryCache = useQueryCache();
  db.changes({ since: "now", live: true }).on("change", () => queryCache.invalidateQueries());

  return {
    provide: {
      db,
    },
  };
});
