import { DateTime, Interval } from "luxon";

export const useLogsInfiniteQuery = (options: { pageSize: number }) => {
  const { $db } = useNuxtApp();
  const { locale } = useI18n();

  return useInfiniteQuery({
    key: ["logs"],
    initialPageParam: "9999-99-99T99:99:99.999Z", // the first query is based on an impossible large start timestamp
    query: async ({ pageParam }) => {
      const logs = await $db.find({
        selector: { _id: { $lt: pageParam } }, // instead of using "skip" the query uses cursor pagination for better performance
        limit: options.pageSize,
        sort: [{ _id: "desc" }],
      });
      return logs.docs.map((log) => ({
        id: log._id,
        date: DateTime.fromISO(log.startedAt).toFormat("ccc dd.MM.yyyy", {
          locale: locale.value,
        }),
        startedAt: DateTime.fromISO(log.startedAt).toFormat("HH:mm"),
        stoppedAt: DateTime.fromISO(log.stoppedAt).toFormat("HH:mm"),
        duration: Interval.fromDateTimes(DateTime.fromISO(log.startedAt), DateTime.fromISO(log.stoppedAt))
          .toDuration(["hours", "minutes"])
          .toFormat("h'h'm'm'"),
        customerName: log.customerName,
        projectName: log.projectName,
      }));
    },
    getNextPageParam: (lastPage) => lastPage.at(-1)?.id,
  });
};
