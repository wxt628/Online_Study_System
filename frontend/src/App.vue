<template>
  <div id="app">
    <NavBar />
    <router-view />
    <Footer />
    <LoginModal v-if="showLoginModal" @close="closeLoginModal" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'
// import Footer from './components/layout/Footer.vue'
// import LoginModal from './components/common/LoginModal.vue'

const authStore = useAuthStore()
const showLoginModal = ref(false)

const closeLoginModal = () => {
  showLoginModal.value = false
}
</script>