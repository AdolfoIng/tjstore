import { ProductService } from "@/services/product.service";
import { defineStore } from "pinia";
import { ref } from "vue";
import type { Product, ProductForm } from "@/types/product";

export const useProductStore = defineStore('product', () => {
    const products = ref<Product[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function loadProductos() {
        loading.value = true
        error.value = null

        try {
            products.value = await ProductService.getAllProducts()
        } catch (err) {
            error.value = (err as Error)?.message ?? 'Error al cargar Productos ..'
        } finally {
            loading.value = false
        }
    }

    async function createProduct(product: ProductForm) {
        loading.value = true
        error.value = null
        console.log('store');
        console.log(product);
        try {
            const newProduct = await ProductService.createProduct(product)
            products.value.unshift(newProduct)
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
            const index = products.value.findIndex(p => p.id === id)
            if (index !== -1) {
                products.value[index] = updatedProduct
            }
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
            products.value = products.value.filter(p => p.id !== id)
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
        loadProductos,
        createProduct,
        updateProduct,
        desactiveProduct
    }
})