import type { Log } from "~~/shared/db";

export const useProjectsQuery = () => {
  const { $db } = useNuxtApp();

  return useQuery({
    key: ["projects"],
    query: async () => {
      const logs = (await $db.find({
        fields: ["customerName", "projectName"],
        selector: { customerName: { $exists: true }, projectName: { $exists: true } },
        limit: Infinity,
      })) as PouchDB.Find.FindResponse<Required<Pick<Log, "customerName" | "projectName">>>;

      return logs.docs;
    },
  });
};
