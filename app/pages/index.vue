<script setup lang="ts">
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
  <div class="home">
    <OnyxHeadline :id="recentProjectsId" class="home__recent-projects-headline" is="h2">Recent projects</OnyxHeadline>
    <div class="home__recent-projects" role="list" :aria-labelledby="recentProjectsId">
      <ProjectCard
        v-for="project in recentProjects"
        :key="`${project.customerName}>${project.projectName}`"
        :project
        :showStopButton="currentLog !== undefined && isCurrentLog(project)"
        :disabled="currentLog !== undefined && !isCurrentLog(project)"
        @startClick="startLogging(project)"
        @stopClick="stopLogging()"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sit-onyx/breakpoints.scss";

.home {
  margin: 0 auto;

  @include breakpoints.screen(min, md) {
    width: 75dvw;
  }

  &__recent-projects-headline {
    margin-bottom: 0.75rem;
  }

  &__recent-projects {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
