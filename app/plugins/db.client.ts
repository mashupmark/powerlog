import PouchDB from "pouchdb";

/** Type of the entries stored within the db */
export type Log = { name: string };

export default defineNuxtPlugin(() => {
  const db = new PouchDB<Log>("logs");

  // Sync the local db to the remote one proxied through the "/db" route
  const remoteDBUrl = new URL("/db/logs", window.location.origin).toString();
  db.sync(remoteDBUrl, { live: true });

  return {
    provide: {
      db,
    },
  };
});
