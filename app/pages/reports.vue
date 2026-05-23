<script setup lang="ts">
const { data: projects, isLoading } = useProjectsQuery();

const projectsByCustomer = computed(() =>
  projects.value?.reduce<Record<string, Set<string>>>((acc, log) => {
    acc[log.customerName] ??= new Set<string>();
    acc[log.customerName]?.add(log.projectName);
    return acc;
  }, {}),
);

const currentSelection = shallowRef<{ customerName: string; projectName: string }>();
</script>

<template>
  <OnyxPageLayout class="reports">
    <template #sidebar>
      <OnyxSidebar label="Customers">
        <template #header><OnyxHeadline is="h3">Customers</OnyxHeadline></template>

        <OnyxAccordion :skeleton="isLoading">
          <OnyxAccordionItem v-for="(projects, customer) in projectsByCustomer" :key="customer" :value="customer">
            <template #header>
              <div :class="{ 'customer--active': customer === currentSelection?.customerName }">{{ customer }}</div>
            </template>

            <OnyxMenuItem
              v-for="project in projects"
              :key="project"
              :active="customer === currentSelection?.customerName && project === currentSelection?.projectName"
              @click="currentSelection = { customerName: customer, projectName: project }"
            >
              {{ project }}
            </OnyxMenuItem>
          </OnyxAccordionItem>
        </OnyxAccordion>
      </OnyxSidebar>
    </template>
  </OnyxPageLayout>
</template>

<style lang="scss" scoped>
.reports {
  // Change the color of the customer accordion item of the currently selected project
  .customer--active {
    color: var(--onyx-color-text-icons-primary-bold);
  }
}
</style>
