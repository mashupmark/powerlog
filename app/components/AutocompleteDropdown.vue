<script setup lang="ts">
const { t } = useI18n();

const props = defineProps<{
  label: string;
  listLabel: string;
  modelValue?: string;
  options: string[];
  required?: boolean;
}>();

const emit = defineEmits<{ "update:modelValue": [string | undefined] }>();

const search = ref("");

const options = computed(() => {
  const filteredOptions = props.options
    .filter((option) => option.toLowerCase().includes(search.value.toLowerCase()))
    .map((value) => ({ value, label: value }));

  // Display option to create the new value if there isn't already an exact match
  if (search.value.trim().length > 0 && !filteredOptions.some((option) => option.value === search.value)) {
    filteredOptions.push({ value: search.value, label: `${t("create")}: "${search.value}"` });
  }

  return filteredOptions;
});
</script>

<template>
  <OnyxSelect
    v-model:searchTerm="search"
    :modelValue="props.modelValue"
    :label="props.label"
    :listLabel="props.listLabel"
    :options
    withSearch
    :required="props.required"
    @update:modelValue="emit('update:modelValue', $event ?? undefined)"
  />
</template>
