import type { Log } from "~/plugins/db.client";

export const useCustomerProjectsQuery = (customer: MaybeRef<string | undefined>) => {
  const { $db } = useNuxtApp();

  return useQuery({
    key: () => ["customers", unref(customer) ?? "", "projects"],
    enabled: () => !!unref(customer),
    query: async () => {
      const projects: PouchDB.Find.FindResponse<Pick<Log, "projectName">> = await $db.find({
        fields: ["projectName"],
        selector: { customerName: unref(customer), projectName: { $exists: true } },
      });
      return Array.from(new Set(projects.docs.map(({ projectName }) => projectName!)));
    },
  });
};
