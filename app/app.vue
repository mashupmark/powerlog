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
