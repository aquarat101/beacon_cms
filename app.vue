<script setup>
import liff from '@line/liff'

const { public: config } = useRuntimeConfig()
const loaded = ref(false)
const isLoading = ref(true) // ✅ state สำหรับ popup โหลด

definePageMeta({
  head: {
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' }
    ]
  }
})

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
      isLoading.value = true
      console.log("Already logged in !!!")
    }
    loaded.value = true
  } catch (err) {
    console.error('LIFF init or login error:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <!-- ✅ Popup Loading -->
  <div v-if="isLoading" class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
      <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-lg font-semibold text-[#035CB2]">Loading...</p>
    </div>
  </div>

  <div v-if="loaded">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>


<style scoped>
h1 {
  text-shadow: 0px 0px 2px #035CB2;
  color: #fff;
}

.text-outline-blue {
  color: white;
  paint-order: stroke fill;
  -webkit-text-stroke: 3px #035CB2;
}
</style>
