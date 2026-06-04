import type { Log } from "~~/shared/db";

export const useProjectsQuery = () => {
  const { $db } = useNuxtApp();

  return useQuery({
    key: ["projects"],
    query: async () => {
      const logs = (await $db.find({
        fields: ["customerName", "projectName"],
        selector: { customerName: { $exists: true }, projectName: { $exists: true } },
        limit: (2 ^ 32) - 1,
      })) as PouchDB.Find.FindResponse<Required<Pick<Log, "customerName" | "projectName">>>;

      // Sorting within the query would require an extra index, so to save space sorting is done as computation
      return logs.docs.sort(
        (a, b) => a.customerName.localeCompare(b.customerName) || a.projectName.localeCompare(b.projectName),
      );
    },
  });
};
