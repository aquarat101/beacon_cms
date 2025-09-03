<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import liff from '@line/liff'

const router = useRouter()
const { public: config } = useRuntimeConfig()
const userId = ref(null)

const isLoading = ref(false)
const completed = ref(false)

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
  if (!validateForm()) return // ถ้า validate ไม่ผ่านจะหยุดตรงนี้

  isLoading.value = true

  try {
    form.userId = userId.value
    const res = await fetch(`${config.apiDomain}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (res.ok) {
      completed.value = true
      setTimeout(() => {
        completed.value = false
        router.push(`/users/user_profile/${userId.value}`)
      }, 800)

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
    isLoading.value = false
  }
}

function validateForm() {
  let valid = true

  // รีเซ็ตข้อความ error ก่อน
  errors.firstName = ''
  errors.lastName = ''
  errors.email = ''
  errors.phone = ''

  if (!form.firstName.trim()) {
    errors.firstName = 'Please enter your first name'
    valid = false
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'Please enter your last name'
    valid = false
  }

  if (!form.email.trim()) {
    errors.email = 'Please enter your email'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Invalid email format'
    valid = false
  }

  if (!form.phone.trim()) {
    errors.phone = 'Please enter your phone number'
    valid = false
  } else if (!/^[0-9]{9,15}$/.test(form.phone)) {
    errors.phone = 'Phone number must be 9–15 digits'
    valid = false
  }

  return valid
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

    <!-- ✅ Popup Loading -->
    <div v-if="isLoading" class="fixed inset-0 bg-white bg-opacity-30 flex items-center justify-center z-50">
      <div class="w-16 h-16 border-4 border-white border-t-[#0198FF] rounded-full animate-spin"></div>
    </div>

    <!-- ✅ Popup Completed -->
    <div v-if="completed" class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
        <div class="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-lg font-semibold text-[#20854f]">Completed!!</p>
      </div>
    </div>

    <img src="/images/header_register.png" alt="Register Header" class="w-full  max-h-100 object-cover z-0" />

    <div class="w-full lg:p-8 md:p-8 sm:p-8 max-sm:p-8 -mt-10 bg-white rounded-t-3xl relative z-10 overflow-hidden">
      <form @submit.prevent="handleRegister" class="space-y-20 font-bold max-w-[60rem] m-auto">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block mb-2 text-gray-700">First Name</label>
            <input v-model="form.firstName" type="text" placeholder="First Name"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
            <p v-if="errors.firstName" class="text-red-500 text-sm mt-1">{{ errors.firstName }}</p>
          </div>

          <div>
            <label class="block mb-2 text-gray-700">Last Name</label>
            <input v-model="form.lastName" type="text" placeholder="Last Name"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
            <p v-if="errors.lastName" class="text-red-500 text-sm mt-1">{{ errors.lastName }}</p>
          </div>

          <div>
            <label class="block mb-2 text-gray-700">E-mail</label>
            <input v-model="form.email" type="email" placeholder="Email"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
            <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <label class="block mb-2 text-gray-700">Phone Number</label>
            <input v-model="form.phone" type="tel" placeholder="Phone number"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
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
