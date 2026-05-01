<template>
  <section class="home-page">
    <button class="upload-trigger" @click="openDrawer">传输文件</button>

    <HomeContent @openDrawer="openDrawer" />

    <transition name="fade">
      <div v-if="isDrawerOpen" class="drawer-mask" @click="closeDrawer"></div>
    </transition>
    <transition name="slide">
      <UploadDrawer v-if="isDrawerOpen" @close="closeDrawer" />
    </transition>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, defineAsyncComponent } from 'vue'
import { useGameStore } from '@/stores/game'
import HomeContent from '../components/HomeContent.vue'

const UploadDrawer = defineAsyncComponent(() =>
  import('../components/UploadDrawer.vue')
)

const gameStore = useGameStore()
const isDrawerOpen = ref(false)

function openDrawer() {
  isDrawerOpen.value = true
}

function closeDrawer() {
  isDrawerOpen.value = false
}

onMounted(() => {
  const base = import.meta.env.BASE_URL
  document.body.style.backgroundImage = `url('${base}static/img/1-1.webp'), url('${base}static/img/1-1.jpg')`
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  position: relative;
  padding: 24px;
}

.upload-trigger {
  position: absolute;
  right: 24px;
  top: 24px;
  border: none;
  border-radius: 999px;
  background: #2563eb;
  color: #fff;
  padding: 10px 16px;
  cursor: pointer;
}

.hint {
  margin-top: 12px;
  color: #b45309;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>