<script setup lang="ts">
const props = defineProps<{
  label: string;
  listLabel: string;
  modelValue?: string;
  options: string[];
}>();

const emit = defineEmits<{ "update:modelValue": [string | undefined] }>();

const search = ref("");

const options = computed(() => {
  const filteredOptions = props.options.filter((option) =>
    option.toLowerCase().includes(search.value.toLowerCase()),
  );

  if (
    search.value.trim().length > 0 &&
    !filteredOptions.includes(search.value.trim())
  ) {
    filteredOptions.unshift(search.value);
  }

  return filteredOptions.map((value) => ({ value, label: value }));
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
    @update:modelValue="emit('update:modelValue', $event ?? undefined)"
  />
</template>
