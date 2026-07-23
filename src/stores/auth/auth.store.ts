import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import type { Usuario } from '@/types/usuario'
import { AuthService } from '@/services/auth/auth.service'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const profile = ref<Usuario | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const isReady = ref(false)

    const isAuthenticated = computed(() => Boolean(user.value))

    const fullName = computed(() => {
        if (!profile.value) {
            return user.value?.email ?? ''
        }

        return `${profile.value.nombre} ${profile.value.apellido}`.trim()
    })

    const role = computed(() => profile.value?.rol ?? null)

    async function initializeAuth() {
        if (isReady.value) {
            return
        }

        loading.value = true
        error.value = null

        try {
            const session = await AuthService.getCurrentSession()
            user.value = session?.user ?? null

            if (user.value) {
                profile.value = await AuthService.getProfileByUserId(user.value.id)
            } else {
                profile.value = null
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'No se pudo inicializar la sesión'
        } finally {
            loading.value = false
            isReady.value = true
        }
    }

    async function login(email: string, password: string) {
        loading.value = true
        error.value = null

        try {
            const result = await AuthService.signInWithPassword(email, password)
            user.value = result.user
            profile.value = result.profile

            return result
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Credenciales inválidas'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function logout() {
        loading.value = true
        error.value = null

        try {
            await AuthService.signOut()
            user.value = null
            profile.value = null
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'No se pudo cerrar la sesión'
            throw err
        } finally {
            loading.value = false
            isReady.value = true
        }
    }

    function hydrateSession(sessionUser: User | null, sessionProfile: Usuario | null) {
        user.value = sessionUser
        profile.value = sessionProfile
        isReady.value = true
    }

    AuthService.onAuthStateChange(async (session) => {
        const sessionUser = session?.user ?? null

        if (sessionUser) {
            const sessionProfile = await AuthService.getProfileByUserId(sessionUser.id)
            hydrateSession(sessionUser, sessionProfile)
            return
        }

        hydrateSession(null, null)
    })

    return {
        user,
        profile,
        loading,
        error,
        isReady,
        isAuthenticated,
        fullName,
        role,
        initializeAuth,
        login,
        logout,
        hydrateSession,
    }
})