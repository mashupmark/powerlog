export const useLogsQuery = (options: ComputedRef<{ customerName: string; projectName: string }>) => {
  const { $db } = useNuxtApp();

  return useQuery({
    key: () => ["logs", { customer: options.value.customerName, project: options.value.projectName }],
    query: async () => {
      const logs = await $db.find({
        selector: { customerName: options.value.customerName, projectName: options.value.projectName },
        limit: (2 ^ 32) - 1,
        sort: [{ _id: "desc" }],
      });
      return logs.docs;
    },
  });
};
