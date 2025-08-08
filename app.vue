<script setup>
import liff from '@line/liff'
const { public: config } = useRuntimeConfig()

liff.init({ liffId: config.liffId }).then(async () => {
    try {
        console.log(1)

        if (!liff.isLoggedIn()) {
            console.log(2)
            liff.login()
            console.log(3)
        } else {
          console.log("Already logged in !!!")
        }
        
    } catch (err) {
        console.error('LIFF init or login error:', err)
    }
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</template>
