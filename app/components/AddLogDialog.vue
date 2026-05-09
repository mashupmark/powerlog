<script setup lang="ts">
import { DateTime, Interval } from "luxon";
import type { Log } from "~/plugins/db.client";

const isOpen = ref(false);
const date = ref<Date | undefined>(new Date());
const time = ref<Interval>();
const customer = ref<string>();

const isValidTimeRange = computed(() => time.value?.isValid);
const isValid = computed(() => date.value && time.value && isValidTimeRange.value);

let close: (log: Log | undefined) => void;
const open = () => {
  return new Promise<Log | undefined>((res) => {
    date.value = new Date();
    time.value = undefined;
    customer.value = undefined;
    isOpen.value = true;

    close = (log) => {
      isOpen.value = false;
      res(log);
    };
  });
};

const { data: customers } = useCustomersQuery();
const options = computed(() => {
  if (customer.value && !customers.value?.includes(customer.value)) return [...(customers.value ?? []), customer.value];
  return customers.value ?? [];
});

const save = () => {
  if (!date.value || !time.value) return;

  // Create valid iso timestamps out of the given date and timerange
  const [startedAt, stoppedAt] = [time.value.start?.toISO(), time.value.end?.toISO()];

  if (!startedAt || !stoppedAt) return;
  close({ startedAt, stoppedAt, customerName: customer.value });
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
        :showError="time && !isValidTimeRange"
        error="After needs to be greater than from"
        :popoverOptions="{ fitParent: false }"
        @update:modelValue="
          (value) => {
            if (value === undefined) time = undefined;
            else time = Interval.fromDateTimes(DateTime.fromISO(value.from), DateTime.fromISO(value.to));
          }
        "
      />

      <AutocompleteDropdown v-model="customer" label="Kunde" listLabel="Kunden" :options />
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
