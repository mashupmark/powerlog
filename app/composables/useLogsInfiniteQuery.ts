export const useLogsInfiniteQuery = (options: { pageSize: number }) => {
  const { $db } = useNuxtApp();

  const queryResult = useInfiniteQuery({
    key: ["logs"],
    initialPageParam: "9999-99-99T99:99:99.999Z", // the first query is based on an impossible large start timestamp
    query: async ({ pageParam }) => {
      const logs = await $db.find({
        selector: { _id: { $lt: pageParam } }, // instead of using "skip" the query uses cursor pagination for better performance
        limit: options.pageSize,
        sort: [{ _id: "desc" }],
      });
      return logs.docs;
    },
    getNextPageParam: (lastPage) => lastPage.at(-1)?._id,
    refetchOnMount: true,
  });

  return { ...queryResult, data: computed(() => queryResult.data.value?.pages.flat() ?? []) };
};
