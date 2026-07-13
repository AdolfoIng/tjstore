<script lang="ts" setup>
import { onMounted, reactive, ref, computed, watch } from 'vue'
import { BrandListService } from '@/services/brandList.service'
import { CategoryListService } from '@/services/category.service'
import AlertService from '@/services/sweetalert2/alert.service'
import type { Product, ProductForm } from '@/types/product'
import type { Brand } from '@/types/brand';
import type { Categoria } from '@/types/categoria';

interface Props {
    isOpen: boolean
    product?: Product | null
    isLoading?: boolean
}

interface Emits {
    (e: 'close'): void
    (e: 'save', product: ProductForm): void
}

const emit = defineEmits<Emits>()
const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    product: null,
})

// ============ State ============
const brands = ref<Brand[]>([])
const brandsLoading = ref(false)

const categorias = ref<Categoria[]>([])
const categoriasLoading = ref(false)

const form = reactive<ProductForm>({
    nombre: '',
    descripcion: '',
    precio_venta: 0,
    categoria_id: null,
    marca_id: null
})

const errors = reactive({
    nombre: '',
    descripcion: '',
    precio_venta: '',
    categoria_id: '',
    marca_id: ''
})

// ============ Computed ============
const isEditMode = computed(() => !!props.product)
const modalTitle = computed(() => isEditMode.value ? 'Editar Producto' : 'Crear Nuevo Producto')
const submitButtonText = computed(() => isEditMode.value ? 'Actualizar' : 'Crear')

// ============ Watchers ============
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        if (isEditMode.value && props.product) {
            loadFormData(props.product)
        } else {
            resetForm()
        }
        loadBrands()
        loadCategories()
    }
})

// ============ Methods ============
async function loadBrands(): Promise<void> {
    brandsLoading.value = true
    try {
        brands.value = await BrandListService.getAll()
    } catch (err) {
        AlertService.toastError('Error al cargar marcas')
        console.error(err)
    } finally {
        brandsLoading.value = false
    }
}

async function loadCategories(): Promise<void> {
    categoriasLoading.value = true
    try {
        categorias.value = await CategoryListService.getAllCategorias()
    } catch (err) {
        AlertService.toastError('Error al cargar categorias')
        console.error(err)
    } finally {
        categoriasLoading.value = false
    }
}

function loadFormData(product: Product): void {
    form.nombre = product.nombre
    form.descripcion = product.descripcion
    form.precio_venta = product.precio_venta
    form.categoria_id = product.categoria_id
    form.marca_id = product.marca_id
}

function resetForm(): void {
    form.nombre = ''
    form.descripcion = ''
    form.precio_venta = 0
    form.categoria_id = null
    form.marca_id = null
    clearErrors()
}

function clearErrors(): void {
    errors.nombre = ''
    errors.descripcion = ''
    errors.precio_venta = ''
    errors.categoria_id = ''
    errors.marca_id = ''
}

function validateForm(): boolean {
    clearErrors()
    let isValid = true

    if (!form.nombre.trim()) {
        errors.nombre = 'El nombre es requerido'
        isValid = false
    } else if (form.nombre.trim().length < 3) {
        errors.nombre = 'El nombre debe tener al menos 3 caracteres'
        isValid = false
    }

    if (!form.descripcion.trim()) {
        errors.descripcion = 'La descripción es requerida'
        isValid = false
    } else if (form.descripcion.trim().length < 5) {
        errors.descripcion = 'La descripción debe tener al menos 5 caracteres'
        isValid = false
    }

    if (form.precio_venta <= 0) {
        errors.precio_venta = 'El precio debe ser mayor a 0'
        isValid = false
    }

    if (!form.marca_id) {
        errors.marca_id = 'Debe seleccionar una marca'
        isValid = false
    }

    return isValid
}

async function handleSave(): Promise<void> {
    if (!validateForm()) return

    try {
        console.log('valido el form..');
        console.log(form.marca_id);
        emit('save', { ...form })
    } catch (err) {
        console.error(err)
    }
}

function handleClose(): void {
    resetForm()
    emit('close')
}

// ============ Lifecycle ============
onMounted(() => {
    if (props.isOpen) {
        loadBrands()
        loadCategories()
    }
})
</script>

<template>
    <div v-if="isOpen" class="modal-overlay">
        <div class="modal" role="dialog" aria-labelledby="modal-title">
            <!-- Header -->
            <div class="modal-header">
                <h2 id="modal-title" class="modal-title">{{ modalTitle }}</h2>
                <button type="button" class="close-btn" aria-label="Cerrar modal" @click="handleClose"
                    :disabled="isLoading">
                    ✕
                </button>
            </div>

            <!-- Body -->
            <div class="modal-body">
                <div class="form-group">
                    <!-- Nombre -->
                    <label for="product-name" class="form-label">
                        Nombre del Producto
                        <span class="required" aria-label="requerido">*</span>
                    </label>
                    <input id="product-name" v-model="form.nombre" type="text" class="form-input"
                        :class="{ 'form-input--error': errors.nombre }" placeholder="Ej: Nike Air Max"
                        :disabled="isLoading" autocomplete="off" maxlength="100" />
                    <p v-if="errors.nombre" class="error-message">{{ errors.nombre }}</p>
                    <p class="char-count">{{ form.nombre.length }}/100</p>

                    <!-- Descripción -->
                    <label for="product-description" class="form-label">
                        Descripción del Producto
                        <span class="required" aria-label="requerido">*</span>
                    </label>
                    <textarea id="product-description" v-model="form.descripcion" class="form-input form-textarea"
                        :class="{ 'form-input--error': errors.descripcion }" placeholder="Describe el producto..."
                        :disabled="isLoading" autocomplete="off" maxlength="500" rows="3"></textarea>
                    <p v-if="errors.descripcion" class="error-message">{{ errors.descripcion }}</p>
                    <p class="char-count">{{ form.descripcion.length }}/500</p>

                    <!-- Marca -->
                    <label for="product-brand" class="form-label">
                        Marca
                        <span class="required" aria-label="requerido">*</span>
                    </label>
                    <select id="product-brand" v-model="form.marca_id" class="form-input form-select"
                        :class="{ 'form-input--error': errors.marca_id }" :disabled="isLoading || brandsLoading">
                        <option :value="null">
                            {{ brandsLoading ? 'Cargando marcas...' : 'Selecciona una marca' }}
                        </option>
                        <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                            {{ brand.nombre }}
                        </option>
                    </select>
                    <p v-if="errors.marca_id" class="error-message">{{ errors.marca_id }}</p>

                    <!-- Categoria -->
                    <label for="product-category" class="form-label">
                        Categoria
                        <span class="required" aria-label="requerido">*</span>
                    </label>
                    <select id="product-category" v-model="form.categoria_id" class="form-input form-select"
                        :class="{ 'form-input--error': errors.categoria_id }"
                        :disabled="isLoading || categoriasLoading">
                        <option :value="null">
                            {{ categoriasLoading ? 'Cargando categorias...' : 'Selecciona una categoria' }}
                        </option>
                        <option v-for="category in categorias" :key="category.id" :value="category.id">
                            {{ category.nombre }}
                        </option>
                    </select>
                    <p v-if="errors.categoria_id" class="error-message">{{ errors.categoria_id }}</p>

                    <!-- Precio -->
                    <label for="product-price" class="form-label">
                        Precio de Venta
                        <span class="required" aria-label="requerido">*</span>
                    </label>
                    <input id="product-price" v-model.number="form.precio_venta" type="number" class="form-input"
                        :class="{ 'form-input--error': errors.precio_venta }" placeholder="0.00" :disabled="isLoading"
                        autocomplete="off" step="0.01" min="0" />
                    <p v-if="errors.precio_venta" class="error-message">{{ errors.precio_venta }}</p>
                </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" :disabled="isLoading" @click="handleClose">
                    Cancelar
                </button>
                <button type="button" class="btn btn-primary" :disabled="isLoading" @click="handleSave">
                    <span v-if="!isLoading">{{ submitButtonText }}</span>
                    <span v-else class="loading-spinner"></span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Overlay */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(54, 53, 53, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(10px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Modal Container */
.modal {
    width: 100%;
    max-width: 500px;
    background: rgb(118, 118, 120);
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    animation: slideUp 0.3s ease-out;
}

/* Header */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #334155;
}

.modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #38393a;
}

.close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: #2f2f30;
    font-size: 1.25rem;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.close-btn:hover:not(:disabled) {
    background: rgba(201, 55, 33, 0.1);
}

.close-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Body */
.modal-body {
    padding: 1.5rem;
    max-height: 60vh;
    overflow-y: auto;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-label {
    font-size: 0.95rem;
    font-weight: 500;
    color: #353636;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.required {
    color: #ef4444;
}

.form-input {
    padding: 0.75rem;
    background: #0f172a;
    color: #e2e8f0;
    border: 1px solid #334155;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.2s ease;
}

.form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #1e293b;
}

.form-input--error {
    border-color: #ef4444 !important;
}

.form-textarea {
    resize: vertical;
    font-family: inherit;
}

.form-select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23e2e8f0' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
    padding-right: 2.5rem;
}

.error-message {
    font-size: 0.875rem;
    color: #ef4444;
    margin: 0.25rem 0 0 0;
}

.char-count {
    font-size: 0.75rem;
    color: #323233;
    margin: 0.25rem 0 0 0;
}

/* Footer */
.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.5rem;
    border-top: 1px solid #334155;
    background: rgba(15, 23, 42, 0.5);
}

/* Buttons */
.btn {
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 40px;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: #2c9767;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #1d6444;
    box-shadow: 0 4px 12px rgba(6, 80, 25, 0.4);
}

.btn-secondary {
    background: #475569;
    color: #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
    background: #64748b;
}

.loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>