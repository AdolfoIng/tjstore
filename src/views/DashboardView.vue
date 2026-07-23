<script lang="ts" setup>
import Sidebar from '@/components/dashboard/Sidebar.vue';
import Navbar from '@/components/dashboard/Navbar.vue';
import { routeLocationKey } from 'vue-router';
import type router from '@/router';
</script>

<template>
    <div class="dashboard-container">

        <div class="sidebar">
            <Sidebar />
        </div>
        <div class="page-content">
            <div class="navbar">
                <Navbar />
            </div>

            <div class="main-content">
                <router-view :key="$route.fullPath" />
            </div>

        </div>

    </div>
</template>

<style scoped>
.dashboard-container {
    display: flex;
    height: 100vh;
    background-color: #7c7d7e;
    color: #1b1b1c;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.sidebar {
    width: 180px;
    background-color: #323232;
    color: #ffffff;
    padding: 1rem;
}

.page-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.navbar {
    background-color: #3d2e2e;
    color: #ffffff;
    padding: 1rem;
    height: 60px;
}

.main-content {
    flex: 1;
    /* background-color: #626161; */
    /* color: #1b1b1c; */
    padding: 1rem;
}
</style>
