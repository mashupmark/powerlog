<script lang="ts" setup>
import { iconEdit, iconTrash } from "@sit-onyx/icons";
import { DateTime, Duration, Interval } from "luxon";
import { createFeature, type ColumnConfig, type ColumnGroupConfig, type ColumnTypesFromFeatures } from "sit-onyx";
import type { UnwrapRef } from "vue";

const logDialog = useTemplateRef("logDialog");

const { t, locale } = useI18n();
const db = useDB();

const props = defineProps<{ customer: string; project: string }>();

const { data, isPending } = useLogsQuery(
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
  { key: "date", type: "date", label: t("date"), width: "18ch" },
  { key: "startedAt", type: "time", label: t("start"), width: "10ch" },
  { key: "stoppedAt", type: "time", label: t("stop"), width: "10ch" },
  { key: "duration", type: "duration", label: t("duration"), width: "10ch" },
  { key: "archived", type: "switch", label: t("archived"), width: "min-content" },
  { key: "location", type: "string", label: t("location"), width: "min-content" },
  { key: "notes", type: "string", label: t("note", 2), width: "minmax(24ch, auto)" },
  { key: "id", label: "", type: "editButton", width: "min-content" },
  { key: "_rev", label: "", type: "deleteButton", width: "min-content" },
]);

const withCustomActions = createFeature(() => ({
  name: Symbol("table-actions"),
  typeRenderer: {
    date: dateTypeRenderer(locale),
    time: timeTypeRenderer(),
    duration: durationRenderer(),
    switch: switchRenderer({
      onUpdate: (archived, row) => db.updateLog({ ...row, archived }),
    }),
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
  <div class="report">
    <div class="kpis">
      <KpiCard :header="t('totalTime')" :value="projectDuration.toFormat(`h'h'm'm'`)" />
      <KpiCard :header="t('numberOfLogs')" :value="logs.length.toString()" />
    </div>

    <OnyxDataGrid
      class="data-grid"
      :headline="t('log', 2)"
      :features="[withCustomActions]"
      :data="logs"
      :columns
      :skeleton="isPending"
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
