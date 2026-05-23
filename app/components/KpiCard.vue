<script lang="ts" setup>
const props = defineProps<{ header: string; value: string }>();
</script>

<template>
  <OnyxCard class="kpi-card">
    <div class="kpi-card__header">{{ props.header }}</div>
    <div class="kpi-card__content">
      {{ props.value }}
    </div>
  </OnyxCard>
</template>

<style lang="scss" scoped>
.kpi-card {
  width: fit-content;

  &__header {
    color: var(--onyx-color-text-icons-neutral-medium);
  }

  &__content {
    font-size: 3rem;
    font-weight: var(--onyx-font-weight-semibold);
    line-height: 2.75rem;
  }
}
</style>
