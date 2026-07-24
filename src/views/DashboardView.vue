<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Sidebar from '@/components/dashboard/Sidebar.vue'
import Navbar from '@/components/dashboard/Navbar.vue'

const isSidebarOpen = ref(false)
const isMobileView = ref(false)

function updateViewportState() {
    isMobileView.value = window.innerWidth <= 768

    if (!isMobileView.value) {
        isSidebarOpen.value = false
    }
}

function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
    isSidebarOpen.value = false
}

onMounted(() => {
    updateViewportState()
    window.addEventListener('resize', updateViewportState)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateViewportState)
})
</script>

<template>
    <div class="dashboard-container">
        <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar" />

        <aside class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
            <Sidebar @close-sidebar="closeSidebar" />
        </aside>

        <div class="page-content">
            <header class="navbar">
                <Navbar @toggle-sidebar="toggleSidebar" />
            </header>

            <main class="main-content">
                <router-view :key="$route.fullPath" />
            </main>
        </div>
    </div>
</template>

<style scoped>
.dashboard-container {
    display: flex;
    min-height: 100vh;
    background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.16), transparent 18%), linear-gradient(135deg, #020617, #0f172a);
    color: #e2e8f0;
}

.sidebar {
    width: 260px;
    background: rgba(9, 15, 31, 0.96);
    color: #ffffff;
    padding: 1rem;
    border-right: 1px solid rgba(148, 163, 184, 0.15);
    box-shadow: inset -1px 0 0 rgba(148, 163, 184, 0.06);
    transition: transform 0.28s ease;
    z-index: 20;
}

.page-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.navbar {
    position: sticky;
    top: 0;
    z-index: 10;
    background: rgba(15, 23, 42, 0.88);
    color: #ffffff;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
    backdrop-filter: blur(12px);
}

.main-content {
    flex: 1;
    padding: 1rem;
    min-width: 0;
}

.sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.52);
    backdrop-filter: blur(3px);
    z-index: 15;
}

@media (max-width: 768px) {
    .dashboard-container {
        position: relative;
    }

    .sidebar {
        position: fixed;
        inset: 0 auto 0 0;
        width: min(280px, 82vw);
        transform: translateX(-102%);
        padding-top: 1.2rem;
        border-right: none;
        box-shadow: 0 18px 40px rgba(2, 6, 23, 0.4);
    }

    .sidebar.sidebar-open {
        transform: translateX(0);
    }
}
</style>
