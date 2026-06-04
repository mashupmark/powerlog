import { DateTime } from "luxon";
import type { Log } from "~~/shared/db";

export const useRecentProjectsQuery = () => {
  const { $db } = useNuxtApp();

  return useQuery({
    key: () => ["recent-projects"],
    query: async () => {
      const response: PouchDB.Find.FindResponse<Pick<Log, "customerName" | "projectName" | "location">> =
        await $db.find({
          fields: ["customerName", "projectName", "location"],
          selector: {
            _id: { $gt: DateTime.now().minus({ weeks: 1 }).toUTC().toISO() },
            customerName: { $exists: true },
            projectName: { $exists: true },
          },
          sort: [{ _id: "desc" }],
          limit: Infinity,
        });

      const deduplicatedProjects = response.docs.filter((log, index, array) => {
        const indexOfMatchingItem = array.findIndex(
          ({ customerName, projectName }) => log.customerName === customerName && log.projectName === projectName,
        );
        // Only keep the item if it's a new one, otherwise the index of it would be different
        return index === indexOfMatchingItem;
      });

      return deduplicatedProjects;
    },
  });
};
