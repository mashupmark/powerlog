<script setup lang="ts">
import { iconMediaPlay, iconMediaStop } from "@sit-onyx/icons";

const props = defineProps<{
  project: { customerName?: string; projectName?: string };
  showStopButton?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{ startClick: []; stopClick: [] }>();
</script>

<template>
  <OnyxCard class="project-card" role="listitem">
    <div class="project-card__customer">{{ props.project.customerName }}</div>
    <div class="project-card__project">{{ props.project.projectName }}</div>
    <OnyxIconButton
      v-if="props.showStopButton"
      class="project-card__action-button"
      label="Stop logging"
      :icon="iconMediaStop"
      :disabled="props.disabled"
      @click="emit('stopClick')"
    />
    <OnyxIconButton
      v-else
      class="project-card__action-button"
      label="Start logging"
      :icon="iconMediaPlay"
      :disabled="props.disabled"
      @click="emit('startClick')"
    />
  </OnyxCard>
</template>

<style scoped lang="scss">
.project-card {
  display: grid;
  --onyx-card-gap: 0;
  grid-template-columns: auto 48px;
  grid-template-areas:
    "customer action-button"
    "project action-button";

  &__customer {
    grid-area: customer;
    font-size: var(--onyx-font-size-sm);
  }

  &__project {
    grid-area: project;
    font-size: var(--onyx-font-size-lg);
    font-weight: 500;
  }

  &__action-button {
    grid-area: action-button;
  }
}
</style>
