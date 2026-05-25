<script lang="ts" setup>
import { useToast } from "sit-onyx";

const { $pwa } = useNuxtApp();
const toast = useToast();

watch(
  () => $pwa?.needRefresh,
  (needsRefresh) => {
    if (needsRefresh) {
      toast.show({
        headline: "Update available",
        description: "Click here to update",
        duration: 0,
        clickable: true,
        onClick: () => $pwa?.updateServiceWorker(true),
      });
    }
  },
  { immediate: true },
);
</script>

<template>
  <OnyxAppLayout>
    <template #navBar>
      <OnyxNavBar appName="PowerLog" logoUrl="/powerlog.svg">
        <OnyxNavItem label="Home" link="/" />
        <OnyxNavItem label="Logs" link="/logs" />
        <OnyxNavItem label="Reports" link="/reports" />
      </OnyxNavBar>
    </template>

    <NuxtPage />

    <NuxtRouteAnnouncer />
    <NuxtPwaManifest />
  </OnyxAppLayout>
</template>

<style>
/* Overwrite global styles for onyx page to inherit height from parent so children can also base their height off of it */
.onyx-page__main,
.onyx-page__main > * {
  height: 100%;
}
</style>
