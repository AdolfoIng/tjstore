export interface VentaForm {
    usuario_id: string | null
    nombre_cliente: string
    metodo_pago: string
    total: number
    observaciones: string
}

export interface SaleVariantOption {
    id: string
    producto_id: string
    stock_actual: number
    color_id?: string | null
    talla_id?: string | null
    color?: {
        id: string
        nombre: string
    } | null
    talla?: {
        id: string
        nombre: string
    } | null
}

export interface SaleCatalogProduct {
    id: string
    nombre: string
    descripcion: string
    precio_venta: number
    imagen_url: string | null
    categoria_id?: string | null
    marca_id?: string | null
    marcas?: {
        id: string
        nombre: string
    } | null
    categorias?: {
        id: string
        nombre: string
    } | null
    variants: SaleVariantOption[]
}

export interface SaleCartItemPayload {
    producto_id: string
    producto_variante_id: string
    cantidad: number
    precio_unitario: number
    subtotal: number
}

export interface SaleCreatePayload extends VentaForm {
    items: SaleCartItemPayload[]
}

export interface SaleCartItem {
    id: string
    productId: string
    productName: string
    productImage: string | null
    brandName: string
    variantId: string
    variantLabel: string
    quantity: number
    unitPrice: number
    availableStock: number
}

export interface SaleCartCustomerForm {
    nombre_cliente: string
    metodo_pago: string
    observaciones: string
    usuario_id: string | null
}