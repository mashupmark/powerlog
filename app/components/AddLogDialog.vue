<script setup lang="ts">
import { DateTime } from "luxon";
import type { TimeRange } from "sit-onyx";
import type { Log } from "~/plugins/db.client";

const isOpen = ref(false);
const date = ref<Date | undefined>(new Date());
const time = ref<TimeRange>();

const isValid = computed(() => date.value && time.value);

let close: (log: Log | undefined) => void;
const open = () => {
  return new Promise<Log | undefined>((res) => {
    date.value = new Date();
    time.value = undefined;
    isOpen.value = true;

    close = (log) => {
      isOpen.value = false;
      res(log);
    };
  });
};

const save = () => {
  if (!date.value || !time.value) return;

  // Create valid iso timestamps out of the given date and timerange
  const [startedAt, stoppedAt] = [time.value.from, time.value.to].map((time) =>
    DateTime.fromJSDate(date.value!)
      .set({
        hour: parseInt(time.split(":")[0] ?? "0"),
        minute: parseInt(time.split(":")[1] ?? "0"),
      })
      .toISO(),
  );

  if (!startedAt || !stoppedAt) return;
  close({ startedAt, stoppedAt });
};

defineExpose({ open });
</script>

<template>
  <OnyxModal label="Add Log" nonDismissible :open="isOpen">
    <OnyxForm class="form">
      <OnyxUnstableDatePickerV2 label="Date" required v-model="date" :popoverOptions="{ fitParent: false }" />
      <OnyxUnstableTimePicker
        label="Worktime"
        type="range"
        required
        v-model="time"
        :popoverOptions="{ fitParent: false }"
      />
    </OnyxForm>

    <template #footer>
      <OnyxBottomBar>
        <OnyxButton label="Close" color="neutral" mode="plain" @click="close(undefined)" />
        <OnyxButton label="Save" :disabled="!isValid" @click="save()"></OnyxButton>
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
    width: 50dvw;
  }
}
</style>
