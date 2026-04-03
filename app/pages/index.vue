<script setup lang="ts">
import { iconPlus } from "@sit-onyx/icons";
import { DateTime, Interval } from "luxon";
import { createFeature, DataGridFeatures, type ColumnConfig } from "sit-onyx";
import type { Log } from "~/plugins/db.client";

const { t } = useI18n();
const { $db } = useNuxtApp();

const { data: numberOfLogs } = useQuery({
  key: ["logs", "doc_count"],
  query: async () => (await $db.info()).doc_count,
});

const PAGE_SIZE = 25;
const paginationState = ref<DataGridFeatures.PaginationState>({ current: 1, pageSize: PAGE_SIZE, pages: 0 });

// Everytime the number of logs changes the pagination State needs to be updated
watchEffect(() => (paginationState.value.pages = Math.ceil((numberOfLogs.value ?? 0) / PAGE_SIZE)));

const { data, isPending, isLoading, loadNextPage } = useInfiniteQuery({
  key: ["logs"],
  initialPageParam: "9999-99-99T99:99:99.999Z", // the first query is based on an impossible large start timestamp
  query: async ({ pageParam }) => {
    const logs = await $db.find({
      selector: { startedAt: { $lt: pageParam } }, // instead of using "skip" the query uses cursor pagination for better performance
      limit: PAGE_SIZE,
      sort: [{ startedAt: "desc" }],
    });
    return logs.docs.map((log) => ({
      id: log._id,
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

// Fetch the next page if the current page changes
watch(
  () => paginationState.value.current,
  () => loadNextPage(),
);

const tablePagination = DataGridFeatures.usePagination({
  type: "lazy",
  loading: isLoading,
  paginationState: paginationState,
});

const columns = computed<ColumnConfig<Log & { id: string; duration: string }>[]>(() => [
  { key: "startedAt", type: "string", label: "Start", width: "12ch" },
  { key: "stoppedAt", type: "string", label: "Stop", width: "12ch" },
  { key: "duration", type: "string", label: "Duration", width: "16ch" },
  { key: "customerName", type: "string", label: t("customer") },
  { key: "projectName", type: "string", label: t("project") },
]);

const tableActions = createFeature(() => ({
  name: Symbol("table-actions"),
  actions: () => [
    {
      label: "New Log",
      icon: iconPlus,
      onClick: async () => {
        const now = DateTime.now();
        await $db.put({ _id: now.toISO(), startedAt: now.toISO(), stoppedAt: now.plus({ hours: 1 }).toISO() });
      },
    },
  ],
}));
</script>

<template>
  <OnyxDataGrid
    class="data-grid"
    :features="[tablePagination, tableActions]"
    :data="(data?.pages ?? []).flat()"
    :headline="t('log', 2)"
    :skeleton="isPending"
    :columns
    async
  />
</template>

<style scoped>
.data-grid {
  max-height: 100%;
}
</style>
