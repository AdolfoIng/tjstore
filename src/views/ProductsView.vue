<script lang="ts" setup>
import { ref } from 'vue';


const products = ref([
    { id: 1, nombre: 'Producto A', precio: 10.99 },
    { id: 2, nombre: 'Producto B', precio: 15.49 },
    { id: 3, nombre: 'Producto C', precio: 7.25 },
])

</script>

<template>
    <div class="products-container">
        <!-- Search Section -->
        <section class="section-search">
            <div>
                <label for="search-input" class="search-label">Buscar productos:</label>
                <input id="search-input" type="text" placeholder="Buscar por nombre..." />
            </div>

            <div class="actions-bar">
                <button class="btn btn-primary">
                    <span class="btn-icon">+</span>
                    <span class="btn-text">Agregar Producto</span>
                </button>
            </div>
        </section>

        <!-- Product Table Section -->
        <section class="section-table card">
            <div class="table-status">
                <!-- <span>Cargando productos...</span> -->
            </div>

            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th class="actions">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="product in products" :key="product.id">
                            <td>{{ product.id }}</td>
                            <td>{{ product.nombre }}</td>
                            <td>${{ product.precio.toFixed(2) }}</td>
                            <td class="actions">
                                <button type="button" class="view-stock">
                                    Ver Stock
                                </button>
                                <button type="button" class="edit">
                                    Editar
                                </button>
                                <button type="button" class="delete">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>


<style scoped>
.products-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
}

.section-search {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.btn-primary {

    background: #3ECF8E;
    color: white;
    border: none;
    padding: .7rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: .2s;
}

.btn-primary:hover {
    background: #2fbf7e;
}

/* Table Styles */

table {
    width: 100%;
    border-collapse: collapse;
    background: var(--surface);
}

thead {
    background: #21262d;
}

th {
    color: #8b949e;
    font-weight: 600;
}

tr {
    border-bottom: 1px solid var(--border);
}

tbody tr:hover {
    background: #3d4046;
}
</style>