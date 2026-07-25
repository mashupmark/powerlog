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
  const insertLog = (log: Log) => $db.put(sanetizeLog(log));

  const updateLog = async ({ _id, _rev, ...log }: PouchDB.Core.ExistingDocument<Log>) => {
    // Instead of updating the existing log a new one is created and the old one deleted
    // this is done to keep the _id column in tact since it is indexed by default
    try {
      await deleteLog({ _id, _rev });
      await insertLog(log);
    } catch (e) {
      throw new Error("Failed to replace existing log", { cause: e });
    }
  };

  const deleteLog = async (log: PouchDB.Core.RemoveDocument) => {
    await $db.remove(log);
  };

  const archiveLogs = async (logs: PouchDB.Core.ExistingDocument<Log>[], archived: boolean) => {
    await $db.bulkDocs(
      logs.map((log) => ({ ...sanetizeLog({ ...log, archived: archived }), _id: log._id, _rev: log._rev })),
    );
  };

  return { info, insertLog, updateLog, archiveLogs, deleteLog };
};

// Only take fields which are expected to avoid extra data in the schema less db
const sanetizeLog = (log: Log) => {
  return {
    _id: log.startedAt,
    startedAt: log.startedAt,
    stoppedAt: log.stoppedAt,
    location: log.location,
    customerName: log.customerName,
    projectName: log.projectName,
    notes: log.notes,
    archived: log.archived,
  };
};
