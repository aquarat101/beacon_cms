<script setup>
import liff from '@line/liff'

const { public: config } = useRuntimeConfig()
const loaded = ref(false)

liff.init({ liffId: config.liffId }).then(async () => {
    try {
        if (!liff.isLoggedIn()) {
            liff.login()
        } else {
          loaded.value = true
          console.log("Already logged in !!!")
        }
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
