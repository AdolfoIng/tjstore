# 📋 CRUD de Productos - Documentación Completa

## 🏗️ Arquitectura General

El CRUD de productos está construido siguiendo el patrón **modular y escalable** con separación de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENTES (Vue)                        │
│  ├── ProductsView.vue (Vista Principal)                     │
│  └── ModalProduct.vue (Formulario Modal)                    │
├─────────────────────────────────────────────────────────────┤
│                    STORE (Pinia)                            │
│  └── product.store.ts (Gestión de Estado)                   │
├─────────────────────────────────────────────────────────────┤
│                    SERVICIOS (API)                          │
│  ├── product.service.ts (CRUD de Productos)                 │
│  └── brandList.service.ts (Obtener Marcas)                  │
├─────────────────────────────────────────────────────────────┤
│                    TIPOS (TypeScript)                       │
│  ├── product.ts (Interfaz Product y ProductForm)            │
│  └── brand.ts (Interfaz Brand)                              │
├─────────────────────────────────────────────────────────────┤
│                    API (Supabase)                           │
│  └── Tablas: productos, marcas                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Archivos

### 1. **Tipos (Type Safety)**

```
src/types/
├── product.ts          ← Nuevas interfaces
└── brand.ts            ← Interfaz Brand existente
```

### 2. **Servicios (Lógica de API)**

```
src/services/
├── product.service.ts       ← CRUD completo de productos
├── brandList.service.ts      ← Nuevo: Obtener marcas
└── brand.service.ts         ← Servicios de Marcas
```

### 3. **Stores (Estado Global)**

```
src/stores/
└── product.store.ts         ← Acciones: crear, actualizar, eliminar
```

### 4. **Componentes (UI)**

```
src/components/
└── products/
    └── ModalProduct.vue     ← Formulario reactivo con validación

src/views/
└── ProductsView.vue         ← Vista principal con tabla
```

---

## 🔍 Explicación del Código

### 1. **product.ts - Tipos/Interfaces**

```typescript
export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio_venta: number;
  marca_id: number;
  activo: boolean;
  created_at?: string;
  marcas?: Brand; // Relación con marca
}

export interface ProductForm {
  nombre: string;
  descripcion: string;
  precio_venta: number;
  marca_id: number | null; // Nullable en formulario
}
```

**¿Por qué dos interfaces?**

- `Product`: Representa el producto en la BD con todos los datos
- `ProductForm`: Datos del formulario (sin validar aún)

---

### 2. **product.service.ts - Lógica de API**

```typescript
export const ProductService = {
  async getAllProducts(): Promise<Product[]> {
    // Obtiene productos + marca relacionada
    const { data, error } = await supabase
      .from("productos")
      .select(
        `
                id,
                nombre,
                descripcion,
                precio_venta,
                marca_id,
                activo,
                marcas (id, nombre)  ← JOIN con tabla marcas
            `,
      )
      .eq("activo", true)
      .order("created_at", { ascending: false });

    return data ?? [];
  },
};
```

**Métodos principales:**

| Método                       | Función                                            |
| ---------------------------- | -------------------------------------------------- |
| `getAllProducts()`           | Obtiene todos los productos activos con sus marcas |
| `createProduct(product)`     | Inserta nuevo producto                             |
| `updateProduct(id, product)` | Actualiza producto existente                       |
| `deleteProduct(id)`          | Marca como inactivo                                |

**Patrón de error:**

```typescript
if (error) throw error; // Propaga error al store
```

---

### 3. **product.store.ts - Gestión de Estado**

```typescript
export const useProductStore = defineStore("product", () => {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function createProduct(product: ProductForm) {
    loading.value = true;
    try {
      const newProduct = await ProductService.createProduct(product);
      products.value.unshift(newProduct); // Añade al inicio
      return newProduct;
    } catch (err) {
      error.value = (err as Error)?.message;
      throw err; // Re-lanza para que el componente maneje
    } finally {
      loading.value = false;
    }
  }
});
```

**Patrones utilizados:**

- ✅ **Loading State**: Maneja `loading` para desabilitar UI durante operaciones
- ✅ **Error Handling**: Captura errores pero los re-lanza
- ✅ **Optimistic Updates**: Actualiza lista local sin recargar (excepto en delete)

---

### 4. **ModalProduct.vue - Formulario Reactivo**

```typescript
// Estado reactivo del formulario
const form = reactive<ProductForm>({
  nombre: "",
  descripcion: "",
  precio_venta: 0,
  marca_id: null,
});

// Errors reactivos
const errors = reactive({
  nombre: "",
  descripcion: "",
  precio_venta: "",
  marca_id: "",
});

// Detectar modo crear/editar
const isEditMode = computed(() => !!props.product);

// Cargar datos cuando se abre modal
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (isEditMode.value && props.product) {
        loadFormData(props.product); // Editar
      } else {
        resetForm(); // Crear
      }
      loadBrands(); // Cargar lista de marcas
    }
  },
);
```

**Validación del formulario:**

```typescript
function validateForm(): boolean {
  clearErrors();
  let isValid = true;

  // Validar nombre
  if (!form.nombre.trim()) {
    errors.nombre = "El nombre es requerido";
    isValid = false;
  } else if (form.nombre.trim().length < 3) {
    errors.nombre = "El nombre debe tener al menos 3 caracteres";
    isValid = false;
  }

  // Validar precio
  if (form.precio_venta <= 0) {
    errors.precio_venta = "El precio debe ser mayor a 0";
    isValid = false;
  }

  // Validar marca
  if (!form.marca_id) {
    errors.marca_id = "Debe seleccionar una marca";
    isValid = false;
  }

  return isValid;
}
```

**Eventos Emitidos:**

```typescript
emit("save", { ...form }); // Envía datos al componente padre
```

---

### 5. **ProductsView.vue - Vista Principal**

**Funcionalidades:**

```typescript
// Filtro en tiempo real
const filteredProducts = () => {
  if (!searchQuery.value.trim()) return productStore.products;

  const query = searchQuery.value.toLowerCase();
  return productStore.products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(query) ||
      p.descripcion.toLowerCase().includes(query) ||
      p.marcas?.nombre.toLowerCase().includes(query),
  );
};

// Crear producto
function openCreateModal(): void {
  editingProduct.value = null;
  isModalOpen.value = true;
}

// Editar producto
function openEditModal(product: Product): void {
  editingProduct.value = product;
  isModalOpen.value = true;
}

// Guardar (crear o actualizar)
async function handleSaveProduct(productForm: ProductForm): Promise<void> {
  try {
    if (editingProduct.value) {
      await productStore.updateProduct(editingProduct.value.id, productForm);
      AlertService.toastSuccess("Producto actualizado correctamente");
    } else {
      await productStore.createProduct(productForm);
      AlertService.toastSuccess("Producto creado correctamente");
    }
    closeModal();
  } catch (err) {
    AlertService.toastError("Error al guardar el producto");
  }
}
```

---

## 🎨 Flujo de Usuario

### Crear Producto:

```
1. Click en "Agregar Producto"
   ↓
2. Modal abre vacío
   ↓
3. Usuario llena datos
   ↓
4. Click "Crear"
   ↓
5. Validación (Modal)
   ↓
6. ProductService.createProduct()
   ↓
7. Supabase INSERT
   ↓
8. Store actualiza lista
   ↓
9. Toast "Producto creado"
```

### Editar Producto:

```
1. Click en ícono "Editar"
   ↓
2. Modal abre con datos precargados
   ↓
3. Usuario modifica datos
   ↓
4. Click "Actualizar"
   ↓
5. Validación
   ↓
6. ProductService.updateProduct()
   ↓
7. Supabase UPDATE
   ↓
8. Store actualiza lista
   ↓
9. Toast "Producto actualizado"
```

---

## 🔐 Validaciones

### En el Modal (Client-side):

- ✅ Nombre: mínimo 3 caracteres
- ✅ Descripción: mínimo 5 caracteres
- ✅ Precio: mayor a 0
- ✅ Marca: requerida

### En Supabase (Server-side):

```sql
-- Estos checks en la BD son recomendados:
ALTER TABLE productos
ADD CONSTRAINT nombre_length CHECK (char_length(nombre) >= 3),
ADD CONSTRAINT precio_positive CHECK (precio_venta > 0),
ADD CONSTRAINT marca_required CHECK (marca_id IS NOT NULL);
```

---

## 🎯 Buenas Prácticas Implementadas

### 1. **Tipado Fuerte (TypeScript)**

```typescript
// ❌ Malo
async function createProduct(data: any) {}

// ✅ Bueno
async function createProduct(product: ProductForm): Promise<Product> {}
```

### 2. **Separación de Responsabilidades**

```
Service → Conecta con API
Store   → Maneja estado global
Modal   → Valida y formatea datos
Vista   → Renderiza y captura interacciones
```

### 3. **Reactividad Correcta**

```typescript
// ✅ Usar ref() y reactive()
const products = ref<Product[]>([])
const form = reactive<ProductForm>({...})

// ✅ Usar computed() para valores derivados
const isEditMode = computed(() => !!props.product)

// ✅ Usar watch() para efectos secundarios
watch(() => props.isOpen, (newVal) => {...})
```

### 4. **Manejo de Errores**

```typescript
try {
  await operation();
} catch (err) {
  error.value = (err as Error)?.message;
  AlertService.toastError("Error humanizado");
} finally {
  loading.value = false;
}
```

### 5. **Estados de Carga**

```typescript
// ✅ Desabilitar UI durante carga
<button :disabled="isLoading">Guardar</button>
<span v-if="isLoading" class="loading-spinner"></span>
```

---

## 📊 Esquema de BD (Referencia)

```sql
-- Tabla productos (esperada)
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    precio_venta DECIMAL(10, 2) NOT NULL,
    marca_id INTEGER NOT NULL REFERENCES marcas(id),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla marcas (esperada)
CREATE TABLE marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🚀 Cómo Extender

### Agregar búsqueda por marca específica:

```typescript
// En product.service.ts
async searchByBrand(brandId: number): Promise<Product[]> {
    const { data, error } = await supabase
        .from('productos')
        .select('...')
        .eq('marca_id', brandId)
        .eq('activo', true)

    if (error) throw error
    return data ?? []
}

// En product.store.ts
async function searchByBrand(brandId: number) {
    products.value = await ProductService.searchByBrand(brandId)
}
```

### Agregar descarga de datos (export):

```typescript
// En product.service.ts
export function exportToCSV(products: Product[]) {
  const csv = products
    .map((p) => `${p.id},${p.nombre},${p.descripcion},${p.precio_venta}`)
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "productos.csv";
  a.click();
}
```

---

## ✅ Checklist de Funcionalidades

- [x] Crear producto
- [x] Leer productos
- [x] Actualizar producto
- [x] Eliminar producto (soft delete)
- [x] Validación en formulario
- [x] Búsqueda por nombre/descripción/marca
- [x] Manejo de errores
- [x] Estados de carga
- [x] Tipado TypeScript
- [x] Relación con tabla marcas
- [x] UI modular y responsive

---

## 🔗 Recursos Relacionados

- [Documentación Pinia](https://pinia.vuejs.org/)
- [Documentación Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Documentación Supabase](https://supabase.com/docs)
- [TypeScript en Vue 3](https://vuejs.org/guide/typescript/overview.html)
