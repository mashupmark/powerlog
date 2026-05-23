<script setup lang="ts">
import { DateTime, Interval } from "luxon";
import type { TimeRange } from "sit-onyx";
import type { Log } from "~~/shared/db";

const isOpen = ref(false);
const date = ref<Date | undefined>();
const time = ref<TimeRange>();
const customer = ref<string>();
const project = ref<string>();

// Partial type of Log which only contains the fields relevant for this modal
type PartialLog = Pick<Log, "startedAt" | "stoppedAt" | "customerName" | "projectName">;

let close: (log: PartialLog | undefined) => void;
const open = (initialData?: PartialLog) => {
  // Initialize / reset all fields before actually opening the modal
  date.value = initialData ? new Date(initialData.startedAt) : new Date();
  time.value =
    initialData?.startedAt && initialData.stoppedAt
      ? {
          from: DateTime.fromISO(initialData.startedAt).toFormat("HH:mm"),
          to: DateTime.fromISO(initialData.stoppedAt).toFormat("HH:mm"),
        }
      : undefined;
  customer.value = initialData?.customerName ?? undefined;
  project.value = initialData?.projectName ?? undefined;
  isOpen.value = true;

  return new Promise<PartialLog | undefined>((res) => {
    close = (log) => {
      isOpen.value = false;

      // If close was called with undefined the modal is supposed to close without saving
      if (log === undefined) res(undefined);
      else res({ ...initialData, ...log });
    };
  });
};

const { data: customers } = useCustomersQuery();
const customerOptions = computed(() => {
  if (customer.value && !customers.value?.includes(customer.value)) return [...(customers.value ?? []), customer.value];
  return customers.value ?? [];
});

const { data: projects } = useCustomerProjectsQuery(customer);
const projectOptions = computed(() => {
  if (project.value && !projects.value?.includes(project.value)) return [...(projects.value ?? []), project.value];
  return projects.value ?? [];
});

// Clear project field if the customer is cleared since there shouldn't be a project without a customer
watch(customer, () => {
  if (customer.value === undefined) project.value = undefined;
});

// Second version of the currently given time used for validation e.g. checking from is before to
const timeAsInterval = computed(() => {
  if (!time.value) return undefined;
  return Interval.fromDateTimes(DateTime.fromISO(time.value.from), DateTime.fromISO(time.value.to));
});

const isValid = computed(
  () => date.value && timeAsInterval.value?.isValid && (!!customer.value ? !!project.value : true),
);

const save = () => {
  if (!date.value || !timeAsInterval.value?.isValid) return;

  // Create valid iso timestamps out of the given date and timerange
  const start = DateTime.fromJSDate(date.value).set({
    hour: timeAsInterval.value.start.hour,
    minute: timeAsInterval.value.start.minute,
  });
  const stop = DateTime.fromJSDate(date.value).set({
    hour: timeAsInterval.value.end.hour,
    minute: timeAsInterval.value.end.minute,
  });

  const [startedAt, stoppedAt] = [start.toUTC().toISO(), stop.toUTC().toISO()];
  if (!startedAt || !stoppedAt) return;

  close({ startedAt, stoppedAt, customerName: customer.value, projectName: project.value });
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
        v-model="time"
        required
        :showError="time && !timeAsInterval?.isValid"
        error="After needs to be greater than from"
        :popoverOptions="{ fitParent: false }"
      />

      <AutocompleteDropdown v-model="customer" label="Kunde" listLabel="Kunden" :options="customerOptions" />
      <AutocompleteDropdown
        v-if="customer"
        v-model="project"
        label="Projekt"
        listLabel="Projekte"
        :options="projectOptions"
        :required="!!customer"
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  padding: 2rem;
  width: 90dvw;

  @include breakpoints.screen(min, sm) {
    width: 50dvw;
  }
}
</style>
