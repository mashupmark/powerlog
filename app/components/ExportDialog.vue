<script setup lang="ts">
import { DateTime, Interval } from "luxon";
import { unparse } from "papaparse";

const { t, locale } = useI18n();
const { $db } = useNuxtApp();

type ExportOptions = { start: Date; end: Date };

const isOpen = ref(false);
const timeRange = ref<ExportOptions>();

let close: () => void;
const open = () => {
  timeRange.value = undefined;
  isOpen.value = true;

  return new Promise<void>((res) => {
    close = () => {
      isOpen.value = false;
      res();
    };
  });
};

const isValid = computed(() => timeRange.value?.end !== undefined);

const downloadFile = (data: string, fileName: string, fileType: string) => {
  const url = URL.createObjectURL(new Blob([data], { type: fileType }));

  const el = document.createElement("a");
  el.href = url;
  el.setAttribute("download", fileName);
  el.click();

  el.remove();
  URL.revokeObjectURL(url);
};

const { mutate, isLoading } = useMutation({
  mutation: async () => {
    if (timeRange.value?.end === undefined) throw new Error("Can't export without end date");

    const data = await $db.find({
      selector: {
        $and: [
          { _id: { $gt: DateTime.fromJSDate(timeRange.value.start).startOf("day").toUTC().toISO() } },
          { _id: { $lt: DateTime.fromJSDate(timeRange.value.end).endOf("day").toUTC().toISO() } },
        ],
      },
      sort: [{ _id: "asc" }],
      limit: (2 ^ 32) - 1,
    });

    const logs = data.docs.map((doc) => ({
      Date: DateTime.fromISO(doc.startedAt).toFormat("ccc dd.MM.yyyy", { locale: unref(locale) }),
      Start: DateTime.fromISO(doc.startedAt).toFormat("HH:mm"),
      Stop: DateTime.fromISO(doc.stoppedAt).toFormat("HH:mm"),
      Duration: Interval.fromDateTimes(DateTime.fromISO(doc.startedAt), DateTime.fromISO(doc.stoppedAt))
        .toDuration()
        .toFormat("h'h'm'm'"),
      Location: doc.location ?? "",
      Customer: doc.customerName ?? "",
      Project: doc.projectName ?? "",
      Notes: doc.notes ?? "",
    }));

    const csv = unparse(logs, { quotes: true, header: true, escapeFormulae: true });
    downloadFile(csv, "powerlog.csv", "text/csv;charset=utf-8;");
  },
  onSuccess: () => close(),
  onError: (e) => {
    console.error(e);
  },
});

defineExpose({ open });
</script>

<template>
  <OnyxModal :label="t('export')" nonDismissible :open="isOpen">
    <OnyxForm class="form">
      <OnyxUnstableDatePickerV2 :label="t('range')" v-model="timeRange" required selectionMode="range" />
    </OnyxForm>

    <template #footer>
      <OnyxBottomBar>
        <OnyxButton :label="t('close')" color="neutral" mode="plain" @click="close()" />
        <OnyxButton :label="t('export')" :loading="isLoading" :disabled="!isValid" @click="mutate" />
      </OnyxBottomBar>
    </template>
  </OnyxModal>
</template>

<style lang="scss" scoped>
@use "sit-onyx/breakpoints.scss";

.form {
  padding: 2rem;
  width: 90dvw;

  @include breakpoints.screen(min, sm) {
    width: 36em;
  }
}
</style>
