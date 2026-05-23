<script lang="ts" setup>
import { iconEdit, iconTrash } from "@sit-onyx/icons";
import { DateTime, Duration, Interval } from "luxon";
import { createFeature, type ColumnConfig, type ColumnGroupConfig, type ColumnTypesFromFeatures } from "sit-onyx";
import type { UnwrapRef } from "vue";

const logDialog = useTemplateRef("logDialog");

const { $db } = useNuxtApp();
const { t, locale } = useI18n();

const props = defineProps<{ customer: string; project: string }>();

const { data, isLoading } = useLogsQuery(
  computed(() => ({ customerName: props.customer, projectName: props.project })),
);
const logs = computed(() =>
  (data.value ?? []).map((log) => ({
    id: log._id,
    date: log.startedAt,
    duration: Interval.fromDateTimes(DateTime.fromISO(log.startedAt), DateTime.fromISO(log.stoppedAt)).toDuration(),
    ...log,
  })),
);

const projectDuration = computed(() => {
  return logs.value.reduce<Duration>((acc, cur) => {
    return acc.plus(cur.duration);
  }, Duration.fromMillis(0));
});

type TableEntry = UnwrapRef<typeof logs>[number];
type CustomColumnTypes = ColumnTypesFromFeatures<typeof withCustomActions>;
const columns = computed<ColumnConfig<TableEntry, ColumnGroupConfig, CustomColumnTypes>[]>(() => [
  { key: "date", type: "date", label: "Date", width: "16ch" },
  { key: "startedAt", type: "time", label: "Start", width: "10ch" },
  { key: "stoppedAt", type: "time", label: "Stop", width: "10ch" },
  { key: "duration", type: "duration", label: "Duration", width: "10ch" },
  { key: "notes", type: "string", label: t("notes") },
  { key: "id", label: "", type: "editButton", width: "min-content" },
  { key: "_rev", label: "", type: "deleteButton", width: "min-content" },
]);

const withCustomActions = createFeature(() => ({
  name: Symbol("table-actions"),
  typeRenderer: {
    date: dateTypeRenderer(locale),
    time: timeTypeRenderer(),
    duration: durationRenderer(),
    editButton: buttonRenderer<TableEntry>({
      label: "Edit log",
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
          });
        } catch (e) {
          throw new Error("Failed to replace existing log", { cause: e });
        }
      },
    }),
    deleteButton: buttonRenderer<TableEntry>({
      label: "Delete log",
      icon: iconTrash,
      onClick: async (row) => {
        await $db.remove(row);
      },
    }),
  },
}));
</script>

<template>
  <div class="report">
    <div class="kpis">
      <KpiCard header="Total time" :value="projectDuration.toFormat(`h'h'm'm'`)" />
    </div>

    <OnyxDataGrid
      class="data-grid"
      :headline="t('log', 2)"
      :features="[withCustomActions]"
      :data="logs"
      :columns
      :skeleton="isLoading"
      truncation="ellipsis"
    />

    <LogDialog ref="logDialog" />
  </div>
</template>

<style lang="scss" scoped>
.report {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  .kpis {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .data-grid {
    min-height: 0;
  }
}
</style>
