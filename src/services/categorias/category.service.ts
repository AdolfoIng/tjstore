import { supabase } from '@/api/supabase'
import type { Categoria } from '@/types/categoria'

export const CategoryListService = {
    async getAllCategorias(): Promise<Categoria[]> {
        const { data, error } = await supabase
            .from('categorias')
            .select('id, nombre')
            .order('nombre', { ascending: true })

        if (error) throw error
        return data ?? []
    }
}
