import type { Brand } from './brand';
import type { Categoria } from './categoria';

export interface Product {
    id: string
    nombre: string
    descripcion: string
    precio_venta: number
    categoria_id: string
    marca_id: string
    activo: boolean
    created_at?: string
    imagen_url: string
    categoria?: Categoria  // Relación con categoria (single object)
    marcas?: Brand  // Relación con marca (single object)
}

export interface ProductForm {
    nombre: string
    descripcion: string
    precio_venta: number
    categoria_id: string | null
    marca_id: string | null
    imagen_url: string | null
}
