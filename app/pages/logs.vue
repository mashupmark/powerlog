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
  { key: "date", type: "date", label: t("date"), width: "16ch" },
  { key: "startedAt", type: "time", label: t("start"), width: "10ch" },
  { key: "stoppedAt", type: "time", label: t("stop"), width: "10ch" },
  { key: "duration", type: "duration", label: t("duration"), width: "10ch" },
  { key: "customerName", type: "string", label: t("customer"), width: "min-content" },
  { key: "projectName", type: "string", label: t("project"), width: "min-content" },
  { key: "notes", type: "string", label: t("note", 2) },
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

        // Only insert fields which are expected to avoid extra data in the schema less db
        await $db.put({
          _id: newLog.startedAt,
          startedAt: newLog.startedAt,
          stoppedAt: newLog.stoppedAt,
          customerName: newLog.customerName,
          projectName: newLog.projectName,
          notes: newLog.notes,
        });
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

        // Instead of updating the existing log a new one is created and the old one deleted
        // this is done to keep the _id column in tact since it is indexed by default
        try {
          await $db.remove({ _id: row._id, _rev: row._rev });
          await $db.put({
            _id: updatedLog.startedAt,
            startedAt: updatedLog.startedAt,
            stoppedAt: updatedLog.stoppedAt,
            customerName: updatedLog.customerName,
            projectName: updatedLog.projectName,
            notes: updatedLog.notes,
          });
        } catch (e) {
          throw new Error("Failed to replace existing log", { cause: e });
        }
      },
    }),
    deleteButton: buttonRenderer<TableEntry>({
      label: t("deleteLog"),
      icon: iconTrash,
      onClick: async (row) => {
        await $db.remove(row);
      },
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
