<template>
  <OnyxAppLayout>
    <template #navBar>
      <OnyxNavBar appName="PowerLog">
        <OnyxNavItem label="Home" link="/" />
      </OnyxNavBar>
    </template>

    <OnyxPageLayout>
      <NuxtPage />
    </OnyxPageLayout>

    <NuxtRouteAnnouncer />
  </OnyxAppLayout>
</template>

<style>
/* Overwrite global styles for onyx page to inherit height from parent so children can also base their height off of it */
.onyx-page__main,
.onyx-page__main > * {
  height: 100%;
}
</style>
