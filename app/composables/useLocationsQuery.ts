import { POUCH_DB_MAX_LIMIT, type Log } from "~~/shared/db";

export const useLocationsQuery = () => {
  const { $db } = useNuxtApp();

  return useQuery({
    key: ["locations"],
    query: async () => {
      const locations: PouchDB.Find.FindResponse<Pick<Log, "location">> = await $db.find({
        fields: ["location"],
        selector: { location: { $exists: true } },
        limit: POUCH_DB_MAX_LIMIT,
      });
      return Array.from(new Set(locations.docs.map(({ location }) => location!)));
    },
  });
};
