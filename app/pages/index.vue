<script setup lang="ts">
const { $db } = useNuxtApp();

const { data, addLog } = useDB();
</script>

<template>
  Logs:
  <pre>{{ JSON.stringify(data, undefined, 2) }}</pre>
  <button @click="addLog({ name: 'Test Log' })">Add Log</button>
</template>
