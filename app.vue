<script>
import liff from '@line/liff'

const { public: config } = useRuntimeConfig()

liff.init({ liffId: config.liffId }).then(async () => {
    try {
        if (!liff.isLoggedIn()) {
            liff.login()
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
