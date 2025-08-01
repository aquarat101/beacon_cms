<script setup lang="ts">

</script>

<template>
  <div class="main-layout">
    <div class="content-frame">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.content-frame {
  max-width: 1200px;
  margin: auto;
}
.main-layout {
  background: #000;
}
</style>