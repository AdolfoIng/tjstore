<script lang="ts" setup>
import Sidebar from '@/components/dashboard/Sidebar.vue'
import Navbar from '@/components/dashboard/Navbar.vue'
</script>

<template>
    <div class="dashboard-container">
        <aside class="sidebar">
            <Sidebar />
        </aside>

        <div class="page-content">
            <header class="navbar">
                <Navbar />
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
    background: linear-gradient(135deg, #020617, #0f172a);
    color: #e2e8f0;
}

.sidebar {
    width: 220px;
    background: #0f172a;
    color: #ffffff;
    padding: 1rem;
    border-right: 1px solid rgba(148, 163, 184, 0.15);
}

.page-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.navbar {
    background: rgba(15, 23, 42, 0.82);
    color: #ffffff;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.main-content {
    flex: 1;
    padding: 1rem;
}

@media (max-width: 768px) {
    .dashboard-container {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
    }
}
</style>
