<script setup lang="ts">
import { iconPlus } from "@sit-onyx/icons";

const { $db } = useNuxtApp();

const { data } = useQuery({
  selector: {
    name: { $gte: null },
  },
  fields: ["_id", "name"],
});
</script>

<template>
  <div>
    <OnyxHeadline is="h2">
      <span>Logs</span>
      <OnyxIconButton :icon="iconPlus" label="Add Log" @click="$db.post({ name: 'Test Log' })" />
    </OnyxHeadline>
    <pre>{{ JSON.stringify(data, undefined, 2) }}</pre>
  </div>
</template>
