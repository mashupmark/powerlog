<script setup lang="ts">
const { data: recentProjects } = useRecentProjectsQuery();

const recentProjectsId = useId();
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
      --onyx-card-gap: 0;

      &__customer {
        font-size: var(--onyx-font-size-sm);
      }

      &__project {
        font-size: var(--onyx-font-size-lg);
        font-weight: 500;
      }
    }
  }
}
</style>
