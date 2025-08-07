<script>
import liff from '@line/liff'

liff.init({ liffId: '2007889543-Y63ndk5Q' }).then(async () => {
    try {
        console.log(1)

        if (!liff.isLoggedIn()) {
            console.log(2)
            liff.login()
            console.log(3)

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
