import { DateTime } from "luxon";
import type { Log } from "~~/shared/db";

/**
 * Get the most recently used projects deduplicated by the combination of customer + project name
 * @param options.max Limit for how many projects to return at max
 */
export const useRecentProjectsQuery = (options: { max: number }) => {
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
          limit: (2 ^ 32) - 1,
        });

      const deduplicatedProjects: (typeof response)["docs"] = [];
      for (let index = 0; index < response.docs.length; index++) {
        const log = response.docs[index]!;

        // If the number of deduplicated items already reached the specified max stop early
        if (deduplicatedProjects.length >= options.max) break;

        const indexOfMatchingItem = response.docs.findIndex(
          ({ customerName, projectName }) => log.customerName === customerName && log.projectName === projectName,
        );

        // Only keep the item if it's a new one, otherwise the index of it would be different
        if (index === indexOfMatchingItem) {
          deduplicatedProjects.push(log);
        }
      }

      return deduplicatedProjects;
    },
  });
};
