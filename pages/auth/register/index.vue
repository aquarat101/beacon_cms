<script setup>
import {reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import liff from '@line/liff'

const router = useRouter()
const {public: config} = useRuntimeConfig()

const isLoading = ref(false)
const userId = ref(null)

const form = reactive({
  userId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  avatar: '/images/profile.png',
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
})

async function handleRegister() {
  isLoading.value = true

  errors.firstName = ''
  errors.lastName = ''
  errors.email = ''
  errors.phone = ''

  try {
    // const profile = await liff.getProfile()
    // userId.value = profile.userId
    form.userId = userId.value
    const res = await fetch(`${config.apiDomain}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (res.ok) {
      router.push(`/users/user_profile/${userId.value}`)

      form.firstName = ''
      form.lastName = ''
      form.email = ''
      form.phone = ''

    } else {
      if (data.error && typeof data.error === 'object') {
        Object.assign(errors, data.error)
      } else {
        alert(data.error || 'Registration failed')
      }
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.message)
  } finally {
    isLoading.value = false // หยุดโหลดไม่ว่าจะสำเร็จหรือ error
  }
}

const profile = await liff.getProfile()
userId.value = profile?.userId

onMounted(async () => {
  try {
    const res = await fetch(`${config.apiDomain}/users/findUserByUserId/${userId.value}`);

    if (res.ok) {
      router.push(`/users/user_profile/${userId.value}`)
    }
  } catch (err) {
    console.error('Error checking userId:', err);
  }
})

</script>

<template>
  <div class="min-h-screen bg-white flex flex-col items-center">
    <div v-if="isLoading" class="fixed inset-0 bg-white bg-opacity-30 flex items-center justify-center z-50">
      <div class="w-16 h-16 border-4 border-white border-t-[#0198FF] rounded-full animate-spin"></div>
    </div>

    <img src="/images/header_register.png" alt="Register Header"
         class="w-full min-w-md max-h-100 object-cover z-0"/>

    <div class="w-full min-w-md p-7 -mt-10 bg-white rounded-t-3xl relative z-10 overflow-hidden">
      <form @submit.prevent="handleRegister" class="space-y-20 font-bold max-w-[60rem] m-auto">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block mb-2 text-gray-700">First Name</label>
            <input v-model="form.firstName" type="text" placeholder="First Name"
                   class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]"/>
            <p v-if="errors.firstName" class="text-red-500 text-sm mt-1">{{ errors.firstName }}</p>
          </div>

          <div>
            <label class="block mb-2 text-gray-700">Last Name</label>
            <input v-model="form.lastName" type="text" placeholder="Last Name"
                   class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]"/>
            <p v-if="errors.lastName" class="text-red-500 text-sm mt-1">{{ errors.lastName }}</p>
          </div>

          <div>
            <label class="block mb-2 text-gray-700">E-mail</label>
            <input v-model="form.email" type="email" placeholder="Email"
                   class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]"/>
            <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <label class="block mb-2 text-gray-700">Phone Number</label>
            <input v-model="form.phone" type="tel" placeholder="Phone number"
                   class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]"/>
            <p v-if="errors.phone" class="text-red-500 text-sm mt-1">{{ errors.phone }}</p>
          </div>
        </div>

        <button type="submit"
                class="flex justify-center w-full bg-[#0198FF] font-bold text-white py-3 rounded-2xl text-lg hover:bg-[#0198FF] transition">
          Register
        </button>
      </form>
    </div>
  </div>
</template>
