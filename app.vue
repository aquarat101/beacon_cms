<script setup>
import liff from '@line/liff'

const { public: config } = useRuntimeConfig()
const loaded = ref(false)

liff.init({ liffId: config.liffId }).then(async () => {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('liff.state')) {
      const cleanPath = url.searchParams.get('liff.state') || '/';
      history.replaceState({}, '', cleanPath);
    }
    if (!liff.isLoggedIn()) {
      liff.login()
    } else {
      console.log("Already logged in !!!")
    }
    loaded.value = true
  } catch (err) {
    console.error('LIFF init or login error:', err)
  }
})
</script>

<template>
  <div v-if="loaded">
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</template>
