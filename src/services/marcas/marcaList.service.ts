import { supabase } from '@/api/supabase'
import type { Marca } from '@/types/marca'

export const MarcaListService = {
    async getAll(): Promise<Marca[]> {
        const { data, error } = await supabase
            .from('marcas')
            .select('id, nombre')
            .order('nombre', { ascending: true })

        if (error) throw error
        return data ?? []
    }
}
