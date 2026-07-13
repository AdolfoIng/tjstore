import { ProductService, type ProductPaginationParams } from "@/services/product.service";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Product, ProductForm } from "@/types/product";

interface ProductLoadOptions extends ProductPaginationParams {
    resetPage?: boolean
}

export const useProductStore = defineStore('product', () => {
    const products = ref<Product[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const totalItems = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(3)
    const searchTerm = ref('')

    const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)))

    async function loadProductos(options: ProductLoadOptions = {}) {
        const nextPage = options.resetPage ? 1 : (options.page ?? currentPage.value)
        const requestedPageSize = options.pageSize ?? pageSize.value
        const requestedSearchTerm = options.searchQuery ?? searchTerm.value

        loading.value = true
        error.value = null

        try {
            const result = await ProductService.getProductsPage({
                page: nextPage,
                pageSize: requestedPageSize,
                searchQuery: requestedSearchTerm
            })

            products.value = result.items
            totalItems.value = result.totalCount
            currentPage.value = result.page
            pageSize.value = result.pageSize
            searchTerm.value = requestedSearchTerm

            return result
        } catch (err) {
            error.value = (err as Error)?.message ?? 'Error al cargar productos'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function changePage(page: number) {
        if (page < 1) return

        return loadProductos({
            page,
            searchQuery: searchTerm.value,
            pageSize: pageSize.value
        })
    }

    async function setSearch(query: string) {
        return loadProductos({
            page: 1,
            searchQuery: query,
            pageSize: pageSize.value,
            resetPage: true
        })
    }

    async function createProduct(product: ProductForm) {
        loading.value = true
        error.value = null
        try {
            const newProduct = await ProductService.createProduct(product)
            await loadProductos({
                page: 1,
                searchQuery: searchTerm.value,
                pageSize: pageSize.value,
                resetPage: true
            })
            return newProduct
        } catch (err) {
            error.value = (err as Error)?.message ?? 'Error creando producto'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateProduct(id: string, product: ProductForm) {
        loading.value = true
        error.value = null

        try {
            const updatedProduct = await ProductService.updateProduct(id, product)
            await loadProductos({
                page: currentPage.value,
                searchQuery: searchTerm.value,
                pageSize: pageSize.value
            })
            return updatedProduct
        } catch (err) {
            error.value = (err as Error)?.message ?? 'Error actualizando producto'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function desactiveProduct(id: string) {
        loading.value = true
        error.value = null

        try {
            await ProductService.deleteProduct(id)
            await loadProductos({
                page: currentPage.value,
                searchQuery: searchTerm.value,
                pageSize: pageSize.value
            })
        } catch (err) {
            error.value = (err as Error)?.message ?? 'Error desactivando producto'
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        products,
        loading,
        error,
        totalItems,
        currentPage,
        pageSize,
        totalPages,
        searchTerm,
        loadProductos,
        changePage,
        setSearch,
        createProduct,
        updateProduct,
        desactiveProduct
    }
})