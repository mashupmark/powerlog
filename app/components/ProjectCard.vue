<script setup lang="ts">
import { iconMediaPlay, iconMediaStop } from "@sit-onyx/icons";

const { t } = useI18n();

const props = defineProps<{
  project: { customerName?: string; projectName?: string };
  showStopButton?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{ startClick: []; stopClick: [] }>();
</script>

<template>
  <OnyxCard class="project-card" role="listitem">
    <div>
      <div class="project-card__customer">{{ props.project.customerName }}</div>
      <div class="project-card__project">{{ props.project.projectName }}</div>
      <slot />
    </div>

    <div class="project-card__action-button">
      <OnyxIconButton
        v-if="props.showStopButton"
        :label="t('stopLogging')"
        :icon="iconMediaStop"
        :disabled="props.disabled"
        @click="emit('stopClick')"
      />
      <OnyxIconButton
        v-else
        :label="t('startLogging')"
        :icon="iconMediaPlay"
        :disabled="props.disabled"
        @click="emit('startClick')"
      />
    </div>
  </OnyxCard>
</template>

<style scoped lang="scss">
.project-card {
  display: grid;
  --onyx-card-gap: 0;
  grid-template-columns: auto 48px;

  &__customer {
    font-size: var(--onyx-font-size-sm);
  }

  &__project {
    font-size: var(--onyx-font-size-lg);
    font-weight: 500;
  }

  &__action-button {
    display: grid;
    place-items: center;
  }
}
</style>
