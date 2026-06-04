<script setup lang="ts">
import { iconEdit, iconPlus, iconTrash } from "@sit-onyx/icons";
import { DateTime, Interval } from "luxon";
import {
  createFeature,
  DataGridFeatures,
  type ColumnConfig,
  type ColumnGroupConfig,
  type ColumnTypesFromFeatures,
} from "sit-onyx";
import type { UnwrapRef } from "vue";

const logDialog = useTemplateRef("logDialog");

const { t, locale } = useI18n();
const db = useDB();

const PAGE_SIZE = 25;
const paginationState = ref<DataGridFeatures.PaginationState>({
  current: 1,
  pageSize: PAGE_SIZE,
  pages: 0,
});

// Everytime the number of logs changes the pagination State needs to be updated
watchEffect(() => (paginationState.value.pages = Math.ceil((db.info.value.doc_count ?? 0) / PAGE_SIZE)));

const { data, isPending, isLoading, loadNextPage } = useLogsInfiniteQuery({ pageSize: PAGE_SIZE });
const logs = computed(() =>
  (data.value ?? []).map((log) => ({
    id: log._id,
    date: log.startedAt,
    duration: Interval.fromDateTimes(DateTime.fromISO(log.startedAt), DateTime.fromISO(log.stoppedAt)).toDuration(),
    ...log,
  })),
);

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

type TableEntry = NonNullable<UnwrapRef<typeof logs>>[number];
type CustomColumnTypes = ColumnTypesFromFeatures<typeof tableActions>;
const columns = computed<ColumnConfig<TableEntry, ColumnGroupConfig, CustomColumnTypes>[]>(() => [
  { key: "date", type: "date", label: t("date"), width: "18ch" },
  { key: "startedAt", type: "time", label: t("start"), width: "10ch" },
  { key: "stoppedAt", type: "time", label: t("stop"), width: "10ch" },
  { key: "duration", type: "duration", label: t("duration"), width: "10ch" },
  { key: "location", type: "string", label: t("location"), width: "min-content" },
  { key: "customerName", type: "string", label: t("customer"), width: "min-content" },
  { key: "projectName", type: "string", label: t("project"), width: "min-content" },
  { key: "notes", type: "string", label: t("note", 2), width: "minmax(24ch, auto)" },
  { key: "id", label: "", type: "editButton", width: "min-content" },
  { key: "_rev", label: "", type: "deleteButton", width: "min-content" },
]);

const tableActions = createFeature(() => ({
  name: Symbol("table-actions"),
  actions: () => [
    {
      label: t("addLog"),
      icon: iconPlus,
      onClick: async () => {
        const newLog = await logDialog.value?.open();
        if (!newLog) return;
        await db.insertLog(newLog);
      },
    },
  ],
  typeRenderer: {
    date: dateTypeRenderer(locale),
    time: timeTypeRenderer(),
    duration: durationRenderer(),
    editButton: buttonRenderer<TableEntry>({
      label: t("editLog"),
      icon: iconEdit,
      onClick: async (row) => {
        const updatedLog = await logDialog.value?.open(row);
        if (updatedLog === undefined) return;
        await db.updateLog({ ...updatedLog, _id: row._id, _rev: row._rev });
      },
    }),
    deleteButton: buttonRenderer<TableEntry>({
      label: t("deleteLog"),
      icon: iconTrash,
      onClick: (row) => db.deleteLog(row),
    }),
  },
}));
</script>

<template>
  <OnyxPageLayout>
    <OnyxDataGrid
      class="data-grid"
      :features="[tablePagination, tableActions]"
      :data="logs"
      :headline="t('log', 2)"
      :skeleton="isPending"
      :columns
      async
      truncation="ellipsis"
    />
    <LogDialog ref="logDialog" />
  </OnyxPageLayout>
</template>

<style lang="scss" scoped>
.data-grid {
  max-height: 100%;
}
</style>
