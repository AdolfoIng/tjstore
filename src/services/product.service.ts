import { supabase } from "@/api/supabase"
import type { Product, ProductForm } from "@/types/product"

export interface ProductPaginationParams {
    page?: number
    pageSize?: number
    searchQuery?: string
}

export interface ProductPageResult {
    items: Product[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}

function normalizeSearchQuery(searchQuery?: string): string {
    return searchQuery?.trim() ?? ''
}

export const ProductService = {

    async getProductsPage({
        page = 1,
        pageSize = 8,
        searchQuery
    }: ProductPaginationParams = {}): Promise<ProductPageResult> {
        const normalizedQuery = normalizeSearchQuery(searchQuery)
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        let query = supabase.from('productos')
            .select(`
                id,
                nombre,
                descripcion,
                precio_venta,
                marca_id,
                categoria_id,
                activo,
                created_at,
                imagen_url,
                marcas (
                    id,
                    nombre
                ),
                categorias (
                    id,
                    nombre
                )
            `, { count: 'exact' })
            .eq('activo', true)
            .order('created_at', { ascending: false })

        if (normalizedQuery) {
            const escapedQuery = normalizedQuery.replace(/[%_]/g, '\\$&')
            query = query.or(`nombre.ilike.%${escapedQuery}%,descripcion.ilike.%${escapedQuery}%`)
        }

        const { data, error, count } = await query.range(from, to)

        if (error) {
            console.error(error)
            throw error
        }

        const items = (data as unknown as Product[]) ?? []
        const totalCount = count ?? items.length

        return {
            items,
            totalCount,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(totalCount / pageSize))
        }
    },

    async getAllProducts(): Promise<Product[]> {
        const result = await this.getProductsPage({ page: 1, pageSize: 1000 })
        return result.items
    },

    async createProduct(product: ProductForm): Promise<Product> {
        const { data, error } = await supabase
            .from('productos')
            .insert({
                nombre: product.nombre,
                descripcion: product.descripcion,
                precio_venta: product.precio_venta,
                categoria_id: product.categoria_id,
                marca_id: product.marca_id,
                imagen_url: product.imagen_url,
                activo: true
            })
            .select(`
                id,
                nombre,
                descripcion,
                precio_venta,
                marca_id,
                activo,
                created_at,
                marcas (
                    id,
                    nombre
                )
            `)
            .single()

        if (error) throw error
        return data as unknown as Product
    },

    async updateProduct(id: string, product: ProductForm): Promise<Product> {
        const { data, error } = await supabase
            .from('productos')
            .update({
                nombre: product.nombre,
                descripcion: product.descripcion,
                precio_venta: product.precio_venta,
                marca_id: product.marca_id
            })
            .eq('id', id)
            .select(`
                id,
                nombre,
                descripcion,
                precio_venta,
                marca_id,
                activo,
                created_at,
                marcas (
                    id,
                    nombre
                )
            `)
            .single()

        if (error) throw error
        return data as unknown as Product
    },

    async deleteProduct(idProducto: string): Promise<void> {
        const { error } = await supabase
            .from('productos')
            .update({ activo: false })
            .eq('id', idProducto)

        if (error) throw error
    }

}