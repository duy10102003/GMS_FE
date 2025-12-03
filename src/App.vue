<template>
  <router-view />
</template>

<script setup>
// App.vue chỉ render router-view
// Mỗi view sẽ tự quản lý layout của mình
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
}
</style>
