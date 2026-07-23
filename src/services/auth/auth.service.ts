import { supabase } from '@/api/supabase'
import type { Session, User } from '@supabase/supabase-js'
import type { Usuario } from '@/types/usuario'

export interface AuthLoginResult {
    session: Session | null
    user: User | null
    profile: Usuario | null
}

export const AuthService = {
    async signInWithPassword(email: string, password: string): Promise<AuthLoginResult> {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            throw error
        }

        const profile = data.user ? await this.getProfileByUserId(data.user.id) : null

        return {
            session: data.session,
            user: data.user,
            profile,
        }
    },

    async getProfileByUserId(userId: string): Promise<Usuario | null> {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', userId)
            .maybeSingle()

        if (error && error.code !== 'PGRST116') {
            throw error
        }

        return data as Usuario | null
    },

    async getCurrentSession(): Promise<Session | null> {
        const { data } = await supabase.auth.getSession()
        return data.session
    },

    async getCurrentUser(): Promise<User | null> {
        const { data } = await supabase.auth.getUser()
        return data.user
    },

    async signOut(): Promise<void> {
        const { error } = await supabase.auth.signOut()

        if (error) {
            throw error
        }
    },

    onAuthStateChange(callback: (session: Session | null) => void) {
        return supabase.auth.onAuthStateChange((_event, session) => {
            callback(session)
        })
    },
} 