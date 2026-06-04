import type { Log } from "~~/shared/db";

export const useDB = () => {
  const { $db } = useNuxtApp();

  const { data: info } = useQuery({
    key: ["logs", "doc_count"],
    query: async (): Promise<Pick<PouchDB.Core.DatabaseInfo, "db_name" | "doc_count">> => await $db.info(),
    initialData: () => ({ db_name: "logs", doc_count: 0 }),
  });

  /**
   * Create a new log
   * Only fields existing on in the Log schema will be respected
   */
  const insertLog = async (log: Log) => {
    // Only insert fields which are expected to avoid extra data in the schema less db
    await $db.put({
      _id: log.startedAt,
      startedAt: log.startedAt,
      stoppedAt: log.stoppedAt,
      location: log.location,
      customerName: log.customerName,
      projectName: log.projectName,
      notes: log.notes,
    });
  };

  const updateLog = async (log: PouchDB.Core.ExistingDocument<Log>) => {
    // Instead of updating the existing log a new one is created and the old one deleted
    // this is done to keep the _id column in tact since it is indexed by default
    try {
      await $db.remove({ _id: log._id, _rev: log._rev });
      await $db.put({
        _id: log.startedAt,
        startedAt: log.startedAt,
        stoppedAt: log.stoppedAt,
        location: log.location,
        customerName: log.customerName,
        projectName: log.projectName,
        notes: log.notes,
      });
    } catch (e) {
      throw new Error("Failed to replace existing log", { cause: e });
    }
  };

  const deleteLog = async (log: PouchDB.Core.ExistingDocument<Log>) => {
    await $db.remove(log);
  };

  return { info, insertLog, updateLog, deleteLog };
};
