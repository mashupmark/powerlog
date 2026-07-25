<script setup lang="ts">
import { iconArchive } from "@sit-onyx/icons";

const { t } = useI18n();
const router = useRouter();

const { data: projects, isPending } = useProjectsQuery();

const selection = computed(() => {
  const { customer, project } = router.currentRoute.value.query;
  if (!customer || typeof customer !== "string" || !project || typeof project !== "string") return undefined;
  return { customer, project };
});

const openCustomers = ref(selection.value?.customer ? [selection.value.customer] : []);
const changeSelection = async (customer: string, project: string) => {
  await router.replace({ query: { customer, project, showArchived: showArchived.value ? "true" : undefined } });
};

const showArchived = computed(() => router.currentRoute.value.query.showArchived === "true");
const changeShowArchived = async (showArchived: boolean) => {
  await router.replace({
    query: {
      customer: selection.value?.customer,
      project: selection.value?.project,
      showArchived: showArchived ? "true" : undefined,
    },
  });
};

const groupedByArchived = computed(() =>
  Object.groupBy(projects.value ?? [], (p) => (p.archived ? "archived" : "unarchived")),
);

const projectsByCustomer = computed(() => {
  const logs = [...(groupedByArchived.value.unarchived ?? [])];

  if (showArchived.value === true && groupedByArchived.value.archived !== undefined) {
    logs.push(...groupedByArchived.value.archived);
  }

  return logs.reduce<Record<string, { project: string; archived: boolean }[]>>((acc, log) => {
    acc[log.customerName] ??= [];

    if (acc[log.customerName]?.some(({ project }) => project === log.projectName)) return acc;
    acc[log.customerName]?.push({ project: log.projectName, archived: log.archived });

    return acc;
  }, {});
});
</script>

<template>
  <OnyxPageLayout class="reports">
    <template #sidebar>
      <OnyxSidebar :label="t('customer', 2)">
        <template #header>
          <OnyxHeadline is="h3">{{ t("customer", 2) }}</OnyxHeadline>
        </template>

        <OnyxAccordion :skeleton="isPending" v-model="openCustomers">
          <OnyxAccordionItem v-for="(projects, customer) in projectsByCustomer" :key="customer" :value="customer">
            <template #header>
              <div :class="{ 'customer--active': customer === selection?.customer }">{{ customer }}</div>
            </template>

            <OnyxMenuItem
              v-for="{ project, archived } in projects"
              :key="project"
              :active="customer === selection?.customer && project === selection?.project"
              :label="project"
              :icon="archived ? iconArchive : undefined"
              @click="changeSelection(customer, project)"
            />
          </OnyxAccordionItem>
        </OnyxAccordion>

        <template #footer>
          <OnyxButton
            :label="showArchived ? t('hideArchived') : t('showArchived')"
            :icon="iconArchive"
            mode="plain"
            @click="changeShowArchived(!showArchived)"
          />
        </template>
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
