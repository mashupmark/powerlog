<script setup lang="ts">
import { iconEdit, iconPlus } from "@sit-onyx/icons";
import { DateTime, Interval } from "luxon";
import {
  createFeature,
  DataGridFeatures,
  OnyxSystemButton,
  type ColumnConfig,
  type ColumnGroupConfig,
  type ColumnTypesFromFeatures,
} from "sit-onyx";
import type { UnwrapRef } from "vue";

const addLogDialog = useTemplateRef("addLogDialog");

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
    duration: Interval.fromDateTimes(DateTime.fromISO(log.startedAt), DateTime.fromISO(log.stoppedAt))
      .toDuration(["hours", "minutes"])
      .toFormat("h'h'm'm'"),
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
  { key: "date", type: "date", label: "Date", width: "minmax(16ch, auto)" },
  {
    key: "startedAt",
    type: "time",
    label: "Start",
    width: "minmax(8ch, auto)",
  },
  {
    key: "stoppedAt",
    type: "time",
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
  { key: "id", label: "", type: "editButton", width: "min-content" },
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

        // Only insert fields which are expected to avoid extra data in the schema less db
        await $db.put({
          _id: newLog.startedAt,
          startedAt: newLog.startedAt,
          stoppedAt: newLog.stoppedAt,
          customerName: newLog.customerName,
          projectName: newLog.projectName,
        });
      },
    },
  ],
  typeRenderer: {
    date: DataGridFeatures.createTypeRenderer<any, TableEntry>({
      cell: {
        component: ({ modelValue }) => {
          if (modelValue === undefined) return undefined;
          return DateTime.fromISO(modelValue).toFormat("ccc dd.MM.yyyy", {
            locale: locale.value,
          });
        },
      },
    }),
    time: DataGridFeatures.createTypeRenderer<any, TableEntry>({
      cell: {
        component: ({ modelValue }) => {
          if (modelValue === undefined) return undefined;
          return DateTime.fromISO(modelValue).toFormat("HH:mm");
        },
      },
    }),
    editButton: DataGridFeatures.createTypeRenderer<any, TableEntry>({
      cell: {
        component: ({ row }) =>
          h(OnyxSystemButton, {
            icon: iconEdit,
            label: "Edit log",
            onClick: async () => {
              const updatedLog = await addLogDialog.value?.open(row);
              if (updatedLog !== undefined) {
                // Only update the fields which can be edited by the modal to not add computed fields to the DB
                await $db.put({
                  _id: row._id,
                  _rev: row._rev,
                  startedAt: updatedLog.startedAt,
                  stoppedAt: updatedLog.stoppedAt,
                  customerName: updatedLog.customerName,
                  projectName: updatedLog.projectName,
                });
              }
            },
          }),
      },
    }),
  },
}));
</script>

<template>
  <OnyxDataGrid
    class="data-grid"
    :features="[tablePagination, tableActions]"
    :data="logs"
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
