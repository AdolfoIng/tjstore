export interface Usuario {
    id: string
    nombre: string
    apellido: string
    rol: string
    activo: boolean
    email?: string
    created_at?: string
}