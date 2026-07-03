import { supabase } from '@/api/supabase'
import type { Brand } from '@/types/brand'

export const BrandListService = {
    async getAll(): Promise<Brand[]> {
        const { data, error } = await supabase
            .from('marcas')
            .select('id, nombre')
            .order('nombre', { ascending: true })

        if (error) throw error
        return data ?? []
    }
}
