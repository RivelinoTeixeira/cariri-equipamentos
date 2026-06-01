// Camada de acesso unica.
// - Se o Supabase estiver configurado (.env), usa Supabase.
// - Caso contrario, usa o backend local (localStorage).

import { supabase, isSupabaseConfigured } from './supabase'
import { localAuth, localDB } from './localBackend'

export const backendMode = isSupabaseConfigured ? 'supabase' : 'local'

// ---------------- AUTH ----------------
export const authApi = {
  async signIn({ email, password }) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    }
    return localAuth.signIn(email, password)
  },
  async signUp({ email, password }) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      return data
    }
    return localAuth.signUp(email, password)
  },
  async signOut() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
      return
    }
    return localAuth.signOut()
  },
  async getSession() {
    if (isSupabaseConfigured) {
      const { data } = await supabase.auth.getSession()
      return data.session
    }
    return localAuth.getSession()
  },
  onAuthStateChange(callback) {
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
      return () => data.subscription.unsubscribe()
    }
    // Modo local: nada para escutar
    return () => {}
  }
}

// ---------------- CLIENTES ----------------
export const clientsApi = {
  async list(user) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
    return localDB.listClients(user)
  },
  async create(user, payload) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: payload.name,
          phone: payload.phone,
          plan_id: payload.plan_id,
          plan_value: payload.plan_value,
          used_coupon: payload.used_coupon,
          coupon_value: payload.coupon_value || 0
        })
        .select()
        .single()
      if (error) throw error
      return data
    }
    return localDB.addClient(user, payload)
  },
  async update(user, id, payload) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: payload.name,
          phone: payload.phone,
          plan_id: payload.plan_id,
          plan_value: payload.plan_value,
          used_coupon: payload.used_coupon,
          coupon_value: payload.coupon_value || 0
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    }
    return localDB.updateClient(user, id, payload)
  },
  async remove(user, id) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
      return
    }
    return localDB.removeClient(user, id)
  }
}

// ---------------- LANCAMENTOS ----------------
export const entriesApi = {
  async list(user) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
    return localDB.listEntries(user)
  },
  async create(user, payload) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('entries')
        .insert({
          user_id: user.id,
          description: payload.description,
          value: payload.value,
          type: payload.type
        })
        .select()
        .single()
      if (error) throw error
      return data
    }
    return localDB.addEntry(user, payload)
  },
  async remove(user, id) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('entries').delete().eq('id', id)
      if (error) throw error
      return
    }
    return localDB.removeEntry(user, id)
  }
}
