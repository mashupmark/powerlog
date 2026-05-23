<script setup lang="ts">
import { DateTime, Interval } from "luxon";

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

const currentDateTime = shallowRef(DateTime.now());
watchEffect(() => {
  const interval = setInterval(() => (currentDateTime.value = DateTime.now()), 1_000);
  onWatcherCleanup(() => clearInterval(interval));
});

const workingTime = computed(() => {
  if (currentLog.value === undefined) return;

  const duration = Interval.fromDateTimes(
    DateTime.fromISO(currentLog.value.startedAt),
    currentDateTime.value,
  ).toDuration();

  // Avoid "invalid duration" to be displayed initially
  if (!duration.isValid) return;
  return duration.toFormat("h'h'm'm's's'");
});

const startLogging = (initalOptions?: { customerName?: string; projectName?: string }) => {
  currentLog.value = {
    startedAt: DateTime.now().toUTC().toISO(),
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
  <OnyxPageLayout class="home">
    <ProjectCard
      v-if="currentLog !== undefined"
      class="current-log"
      :project="currentLog"
      showStopButton
      aria-label="Current log"
      @stopClick="stopLogging()"
    >
      <div v-if="workingTime !== undefined" class="current-log__working-time">{{ workingTime }}</div>
    </ProjectCard>

    <OnyxHeadline :id="recentProjectsId" is="h2" class="recent-projects__headline">Recent projects</OnyxHeadline>
    <div v-if="recentProjects?.length" class="recent-projects__list" role="list" :aria-labelledby="recentProjectsId">
      <!-- Show the 5 most recent projects -->
      <ProjectCard
        v-for="project in recentProjects?.slice(0, 5)"
        :key="`${project.customerName}>${project.projectName}`"
        :project
        :showStopButton="currentLog !== undefined && isCurrentLog(project)"
        :disabled="currentLog !== undefined && !isCurrentLog(project)"
        @startClick="startLogging(project)"
        @stopClick="stopLogging()"
      />
    </div>
    <OnyxEmpty v-else class="recent-projects__empty">No projects have been used in the past week</OnyxEmpty>
  </OnyxPageLayout>
</template>

<style lang="scss" scoped>
@use "sit-onyx/breakpoints.scss";

.home {
  margin: 0 auto;

  @include breakpoints.screen(min, md) {
    width: 75dvw;
  }

  .current-log {
    margin-bottom: 2rem;
  }

  .recent-projects {
    &__headline {
      margin-bottom: 0.5rem;
    }

    &__list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    &__empty {
      margin: 0 auto;
    }
  }
}
</style>
