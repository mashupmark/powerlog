<script setup lang="ts">
const { $db } = useNuxtApp();

const { data } = useQuery({
  selector: {
    name: "Test Log",
  },
});
</script>

<template>
  Logs:
  <pre>{{ JSON.stringify(data, undefined, 2) }}</pre>
  <button @click="$db.post({ name: 'Test Log' })">Add Log</button>
</template>
