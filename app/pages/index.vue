<script setup lang="ts">
import { iconMediaPause, iconMediaPlay, iconMediaStop } from "@sit-onyx/icons";

const recentProjectsId = useId();
const { $db } = useNuxtApp();

const currentLog = useCurrentLog();
const { data: recentProjects } = useRecentProjectsQuery();

const isCurrentLog = (recentProject: { customerName?: string; projectName?: string }) => {
  return (
    currentLog.value?.customerName === recentProject.customerName &&
    currentLog.value?.projectName === recentProject.projectName
  );
};

const startLogging = (initalOptions?: { customerName?: string; projectName?: string }) => {
  currentLog.value = {
    startedAt: new Date().toISOString(),
    customerName: initalOptions?.customerName,
    projectName: initalOptions?.projectName,
  };
};

const stopLogging = async () => {
  if (currentLog.value === undefined) return;

  await $db.put({
    _id: currentLog.value.startedAt,
    startedAt: currentLog.value.startedAt,
    stoppedAt: new Date().toISOString(),
    customerName: currentLog.value.customerName,
    projectName: currentLog.value.projectName,
  });
  currentLog.value = undefined;
};
</script>

<template>
  <div class="recent-projects">
    <OnyxHeadline :id="recentProjectsId" class="recent-projects__headline" is="h2">Recent projects</OnyxHeadline>
    <div class="recent-projects__list" role="list" :aria-labelledby="recentProjectsId">
      <OnyxCard
        v-for="project in recentProjects"
        :key="`${project.customerName}>${project.projectName}`"
        class="project-card"
        role="listitem"
      >
        <div class="project-card__customer">{{ project.customerName }}</div>
        <div class="project-card__project">{{ project.projectName }}</div>
        <OnyxIconButton
          v-if="currentLog !== undefined && isCurrentLog(project)"
          class="project-card__action-button"
          label="Stop logging"
          :icon="iconMediaStop"
          @click="stopLogging()"
        />
        <OnyxIconButton
          v-else
          class="project-card__action-button"
          label="Start logging"
          :icon="iconMediaPlay"
          :disabled="currentLog !== undefined"
          @click="startLogging(project)"
        />
      </OnyxCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sit-onyx/breakpoints.scss";

.recent-projects {
  margin: 0 auto;

  @include breakpoints.screen(min, md) {
    width: 75dvw;
  }

  &__headline {
    margin-bottom: 0.75rem;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

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
  }
}
</style>
