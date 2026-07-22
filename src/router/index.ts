import { createRouter, createWebHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";
import ProductsView from "../views/ProductsView.vue";
import VentasView from "../views/VentasView.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/products",
    name: "Products",
    component: ProductsView,
  },
  {
    path: "/sales",
    name: "Sales",
    component: VentasView,
  }
];

const router = createRouter({
  history: createWebHistory(), // Utiliza el historial del navegador para URLs limpias
  routes,
});

export default router;
