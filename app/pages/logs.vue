<script setup lang="ts">
import { iconPlus } from "@sit-onyx/icons";
import { DateTime, Interval } from "luxon";
import { createFeature, DataGridFeatures, type ColumnConfig } from "sit-onyx";
import type { UnwrapRef } from "vue";

const addLogDialog = useTemplateRef("addLogDialog");

const { t } = useI18n();
const { $db } = useNuxtApp();

const { data: numberOfLogs } = useQuery({
  key: ["logs", "doc_count"],
  query: async () => (await $db.info()).doc_count,
});

const PAGE_SIZE = 25;
const paginationState = ref<DataGridFeatures.PaginationState>({
  current: 1,
  pageSize: PAGE_SIZE,
  pages: 0,
});

// Everytime the number of logs changes the pagination State needs to be updated
watchEffect(() => (paginationState.value.pages = Math.ceil((numberOfLogs.value ?? 0) / PAGE_SIZE)));

const { data, isPending, isLoading, loadNextPage } = useLogsInfiniteQuery({ pageSize: PAGE_SIZE });

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

type TableEntry = NonNullable<UnwrapRef<typeof data>>["pages"][number][number];
const columns = computed<ColumnConfig<TableEntry>[]>(() => [
  { key: "date", type: "string", label: "Date", width: "minmax(16ch, auto)" },
  {
    key: "startedAt",
    type: "string",
    label: "Start",
    width: "minmax(8ch, auto)",
  },
  {
    key: "stoppedAt",
    type: "string",
    label: "Stop",
    width: "minmax(8ch, auto)",
  },
  {
    key: "duration",
    type: "string",
    label: "Duration",
    width: "minmax(8ch, auto)",
  },
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
        const newLog = await addLogDialog.value?.open();
        if (!newLog) return;

        await $db.put({ _id: newLog.startedAt, ...newLog });
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
  <AddLogDialog ref="addLogDialog" />
</template>

<style scoped>
.data-grid {
  max-height: 100%;
}
</style>
