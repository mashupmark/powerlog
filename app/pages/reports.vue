<script setup lang="ts">
const { t } = useI18n();

const { data: projects, isLoading } = useProjectsQuery();

const projectsByCustomer = computed(() =>
  projects.value?.reduce<Record<string, Set<string>>>((acc, log) => {
    acc[log.customerName] ??= new Set<string>();
    acc[log.customerName]?.add(log.projectName);
    return acc;
  }, {}),
);

const router = useRouter();

const selection = computed(() => {
  const { customer, project } = router.currentRoute.value.query;
  if (!customer || typeof customer !== "string" || !project || typeof project !== "string") return undefined;
  return { customer, project };
});

const changeSelection = async (customer: string, project: string) => {
  await router.replace({ query: { customer, project } });
};
</script>

<template>
  <OnyxPageLayout class="reports">
    <template #sidebar>
      <OnyxSidebar :label="t('customer', 2)">
        <template #header>
          <OnyxHeadline is="h3">{{ t("customer", 2) }}</OnyxHeadline>
        </template>

        <OnyxAccordion :skeleton="isLoading">
          <OnyxAccordionItem v-for="(projects, customer) in projectsByCustomer" :key="customer" :value="customer">
            <template #header>
              <div :class="{ 'customer--active': customer === selection?.customer }">{{ customer }}</div>
            </template>

            <OnyxMenuItem
              v-for="project in projects"
              :key="project"
              :active="customer === selection?.customer && project === selection?.project"
              @click="changeSelection(customer, project)"
            >
              {{ project }}
            </OnyxMenuItem>
          </OnyxAccordionItem>
        </OnyxAccordion>
      </OnyxSidebar>
    </template>

    <NuxtPage v-if="selection" :customer="selection.customer" :project="selection.project" />
    <div v-else class="empty">
      <OnyxEmpty>{{ t("selectProjectForReport") }}</OnyxEmpty>
    </div>
  </OnyxPageLayout>
</template>

<style lang="scss" scoped>
.reports {
  // Change the color of the customer accordion item of the currently selected project
  .customer--active {
    color: var(--onyx-color-text-icons-primary-bold);
  }

  .empty {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
  }
}
</style>
