<script setup lang="ts">
const { $db } = useNuxtApp();

const { data: logs, execute } = useAsyncData(async () => {
  return (await $db.allDocs({ include_docs: true })).rows.map((r) => r.doc);
});

const addLog = async () => {
  await $db.post({ name: "Test Log" });
  await execute();
};
</script>

<template>
  Logs:
  <pre>{{ JSON.stringify(logs, undefined, 2) }}</pre>
  <button @click="addLog">Add Log</button>
</template>
