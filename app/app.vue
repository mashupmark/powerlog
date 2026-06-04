<script lang="ts" setup>
import { flagDE, flagUS } from "@sit-onyx/flags";
import { type SelectDialogOption } from "sit-onyx";

const { $pwa } = useNuxtApp();
const { t, locale, setLocale } = useI18n();
const availableLocales = [
  { label: "Deutsch", value: "de-DE", icon: flagDE },
  { label: "English", value: "en-US", icon: flagUS },
] satisfies SelectDialogOption[];
</script>

<template>
  <OnyxAppLayout>
    <template #navBar>
      <OnyxNavBar appName="PowerLog" logoUrl="/powerlog.svg">
        <OnyxNavItem :label="t('home')" link="/" />
        <OnyxNavItem :label="t('log', 2)" link="/logs" />
        <OnyxNavItem :label="t('report', 2)" link="/reports" />

        <template #contextArea>
          <OnyxLanguageMenuItem
            :modelValue="locale"
            :options="availableLocales"
            @update:modelValue="setLocale($event as 'de-DE' | 'en-US')"
          />
        </template>

        <template #globalContextArea v-if="$pwa?.needRefresh">
          <OnyxButton :label="t('updateAvailable')" @click="$pwa.updateServiceWorker()" />
        </template>
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
