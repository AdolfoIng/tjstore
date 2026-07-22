import { defineStore } from 'pinia'
import { ref } from 'vue'
import { MarcaService } from '@/services/marcas/marca.service'
import type { Marca } from '@/types/marca'

export const useBrandStore = defineStore('brand', () => {
    const brands = ref<Marca[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function loadBrands() {
        loading.value = true
        error.value = null

        try {
            brands.value = await MarcaService.getAll()
        } catch (err) {
            error.value = (err as Error)?.message ?? 'Error loading brands'
        } finally {
            loading.value = false
        }
    }

    async function addBrand(name: string) {
        loading.value = true
        error.value = null

        try {
            await MarcaService.create(name)
            await loadBrands()
        } catch (err) {
            error.value = (err as Error)?.message ?? 'Error adding brand'
        } finally {
            loading.value = false
        }
    }

    async function updateBrand(id: string, name: string) {
        loading.value = true
        error.value = null

        try {
            await MarcaService.update(id, name)
            await loadBrands()
        } catch (err) {
            error.value = (err as Error)?.message ?? 'Error updating brand'
        } finally {
            loading.value = false
        }
    }

    async function deleteBrand(id: string) {
        loading.value = true
        error.value = null

        try {
            await MarcaService.deleteBrand(id)
            await loadBrands()
        } catch (err) {
            error.value = (err as Error)?.message ?? 'Error deleting brand'
        } finally {
            loading.value = false
        }
    }

    async function searchBrands(query: string) {
        loading.value = true
        error.value = null

        try {
            brands.value = await MarcaService.searchBrand(query)
        } catch (err) {
            error.value = (err as Error)?.message ?? 'Error searching brands'
        } finally {
            loading.value = false
        }
    }

    return {
        brands,
        loading,
        error,
        loadBrands,
        addBrand,
        updateBrand,
        deleteBrand,
        searchBrands
    }
})
