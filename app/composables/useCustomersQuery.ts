import { POUCH_DB_MAX_LIMIT, type Log } from "~~/shared/db";

export const useCustomersQuery = () => {
  const { $db } = useNuxtApp();

  return useQuery({
    key: ["customers"],
    query: async () => {
      const customers: PouchDB.Find.FindResponse<Pick<Log, "customerName">> = await $db.find({
        fields: ["customerName"],
        selector: { customerName: { $exists: true } },
        limit: POUCH_DB_MAX_LIMIT,
      });
      return Array.from(new Set(customers.docs.map(({ customerName }) => customerName!)));
    },
  });
};
