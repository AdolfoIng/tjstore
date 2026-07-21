<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { Eye, Pencil, Trash2 } from '@/lib/icons';
import { useProductStore } from '@/stores/product.store';
import AlertService from '@/services/sweetalert2/alert.service';
import ModalProduct from '@/components/products/ModalProduct.vue';
import ProductStockModal from '@/components/products/ProductStockModal.vue';
import ProductPagination from '@/components/products/ProductPagination.vue';
import { useDebounce } from '@/composables/useDebounce';
import type { Product, ProductForm } from '@/types/product';

const productStore = useProductStore();
const isModalOpen = ref(false)
const isStockModalOpen = ref(false)
const editingProduct = ref<Product | null>(null)
const selectedStockProduct = ref<Product | null>(null)
const searchQuery = ref('')

const [debouncedLoadProducts] = useDebounce((page: number) => {
    void productStore.loadProductos({
        page,
        pageSize: productStore.pageSize,
        searchQuery: searchQuery.value,
        resetPage: page === 1
    })
}, 350)

onMounted(() => {
    void productStore.loadProductos({ page: 1, searchQuery: '' })
})

watch(searchQuery, () => {
    void debouncedLoadProducts(1)
})

async function deleteProduct(product: Product): Promise<void> {
    const confirmed = await AlertService.confirm(
        'Eliminar Producto',
        `¿Está seguro que desea eliminar "${product.nombre}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
        await productStore.desactiveProduct(product.id);
        AlertService.toastSuccess('Producto eliminado correctamente');
    } catch (err) {
        AlertService.toastError('Error al eliminar el producto');
        console.error(err);
    }
}

function openCreateModal(): void {
    editingProduct.value = null
    isModalOpen.value = true
}

function openEditModal(product: Product): void {
    editingProduct.value = product;
    isModalOpen.value = true
}

function closeModal(): void {
    isModalOpen.value = false
    editingProduct.value = null
}

function openStockModal(product: Product): void {
    selectedStockProduct.value = product
    isStockModalOpen.value = true
}

function closeStockModal(): void {
    isStockModalOpen.value = false
    selectedStockProduct.value = null
}

async function handleSaveProduct(productForm: ProductForm): Promise<void> {
    try {
        if (editingProduct.value) {
            await productStore.updateProduct(editingProduct.value.id, productForm)
            AlertService.toastSuccess('Producto actualizado correctamente');
        } else {
            await productStore.createProduct(productForm)
            AlertService.toastSuccess('Producto creado correctamente');
        }
        closeModal()
    } catch (err) {
        AlertService.toastError(
            editingProduct.value
                ? 'Error al actualizar el producto'
                : 'Error al crear el producto'
        );
        console.error(err);
    }
}

function handlePageChange(page: number): void {
    void debouncedLoadProducts(page)
}
</script>

<template>
    <div class="products-container">
        <section class="section-search">
            <div class="search-wrapper">
                <label for="search-input" class="search-label">Buscar productos:</label>
                <input id="search-input" v-model="searchQuery" type="text"
                    placeholder="Buscar por nombre, descripción o marca..." class="search-input" />
            </div>

            <div class="actions-bar">
                <button class="btn btn-primary" @click="openCreateModal">
                    <span class="btn-icon">+</span>
                    <span class="btn-text">Agregar Producto</span>
                </button>
            </div>
        </section>

        <section class="section-table card">
            <div class="table-status">
                <span v-if="productStore.loading" class="loading-text">Cargando productos...</span>
                <span v-else-if="productStore.products.length === 0" class="empty-text">
                    No hay productos disponibles
                </span>
            </div>

            <div v-if="!productStore.loading && productStore.products.length > 0" class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Marca</th>
                            <th>Precio</th>
                            <th class="actions">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(product, index) in productStore.products" :key="product.id">
                            <td class="text-center">
                                {{ ((productStore.currentPage - 1) * productStore.pageSize) + index + 1 }}
                            </td>
                            <td><img :src="product.imagen_url" width="50" class="product-image"></td>
                            <td>{{ product.nombre }}</td>
                            <td class="text-truncate" :title="product.descripcion">
                                {{ product.descripcion }}
                            </td>
                            <td>{{ product.marcas?.nombre ?? 'N/A' }}</td>
                            <td class="text-right">${{ product.precio_venta.toFixed(2) }}</td>
                            <td class="actions">
                                <button type="button" class="action-btn view-stock" title="Ver Stock"
                                    @click="openStockModal(product)">
                                    <Eye class="icon" />
                                </button>
                                <button type="button" class="action-btn edit" title="Editar"
                                    @click="openEditModal(product)">
                                    <Pencil class="icon" />
                                </button>
                                <button type="button" class="action-btn delete" title="Eliminar"
                                    @click="deleteProduct(product)">
                                    <Trash2 class="icon" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <ProductPagination v-if="productStore.totalItems > 0" :current-page="productStore.currentPage"
                :total-pages="productStore.totalPages" :total-items="productStore.totalItems"
                :page-size="productStore.pageSize" :is-loading="productStore.loading" @page-change="handlePageChange" />
        </section>

        <ModalProduct :is-open="isModalOpen" :product="editingProduct" :is-loading="productStore.loading"
            @close="closeModal" @save="handleSaveProduct" />

        <ProductStockModal :is-open="isStockModalOpen" :product="selectedStockProduct" @close="closeStockModal" />
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

.search-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.search-label {
    font-size: 0.95rem;
    font-weight: 500;
    color: #8b949e;
}

.search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: #0f172a;
    color: #e2e8f0;
    border: 1px solid #334155;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s ease;
}

.search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.actions-bar {
    display: flex;
    gap: 0.5rem;
}

.btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.btn-primary {
    background: #3ecf8e;
    color: white;
}

.btn-primary:hover {
    background: #2fbf7e;
    box-shadow: 0 4px 12px rgba(62, 207, 142, 0.3);
}

.btn-icon {
    font-size: 1.1rem;
    font-weight: bold;
}

.section-table {
    border-radius: 8px;
    background: var(--surface, #0f172a);
    overflow: hidden;
}

.table-status {
    padding: 2rem;
    text-align: center;
    color: #8b949e;
}

.loading-text,
.empty-text {
    display: inline-block;
}

.empty-text {
    color: #8b949e;
}

.table-responsive {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    background: var(--surface);
}

thead {
    background: #21262d;
    position: sticky;
    top: 0;
}

th {
    padding: 1rem;
    color: #8b949e;
    font-weight: 600;
    text-align: left;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

td {
    padding: 1rem;
    border-bottom: 1px solid #30363d;
    color: #c9d1d9;
}

tbody tr:hover {
    background: #0d1219;
}

.text-center {
    text-align: center;
}

.text-right {
    text-align: right;
}

.text-truncate {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.actions {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    text-align: center;
    width: 140px;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    color: #8b949e;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.action-btn:hover {
    background: #30363d;
}

.action-btn.view-stock:hover {
    color: #3b82f6;
}

.action-btn.edit:hover {
    color: #3ecf8e;
}

.action-btn.delete:hover {
    color: #ef4444;
}

.icon {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
}

.card {
    border: 1px solid #30363d;
}

.product-image {
    object-fit: cover;
    border-radius: 4px;
    /* background: var(--bg-tertiary); */
}

@media (max-width: 768px) {
    .section-search {
        flex-direction: column;
        align-items: stretch;
    }

    .search-wrapper {
        order: 1;
    }

    .actions-bar {
        order: 2;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }

    th,
    td {
        padding: 0.75rem 0.5rem;
        font-size: 0.875rem;
    }

    .action-btn {
        width: 32px;
        height: 32px;
    }
}

@media (max-width: 640px) {
    .products-container {
        padding: 0.75rem;
    }
}
</style>