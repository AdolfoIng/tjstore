import { supabase } from '@/api/supabase'
import type { Brand } from '@/types/brand'

export const BrandService = {
    async getAll(): Promise<Brand[]> {
        const { data, error } = await supabase
            .from('marcas')
            .select('id, nombre, created_at')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data ?? []
    },

    async create(name: string): Promise<Brand> {
        const { data, error } = await supabase
            .from('marcas')
            .insert({ nombre: name })
            .select('id, nombre, created_at')
            .single()

        if (error) throw error
        return data
    },

    async update(id: string, name: string): Promise<Brand> {
        const { data, error } = await supabase
            .from('marcas')
            .update({ nombre: name })
            .eq('id', id)
            .select('id, nombre, created_at')
            .single()

        if (error) throw error
        return data
    },

    async deleteBrand(id: string): Promise<void> {
        const { error } = await supabase
            .from('marcas')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    // Search Brands
    async searchBrand(query: string): Promise<Brand[]> {
        const { data, error } = await supabase
            .from('marcas')
            .select('id, nombre, created_at')
            .ilike('nombre', `%${query}%`)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data ?? []
    }

}
