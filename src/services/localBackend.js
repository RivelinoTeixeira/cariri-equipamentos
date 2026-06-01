// Backend local baseado em localStorage.
// Usado como fallback quando o Supabase nao esta configurado,
// para permitir preview imediato do dashboard.

const KEYS = {
  users: 'nexus:users',
  session: 'nexus:session',
  clients: 'nexus:clients',
  entries: 'nexus:entries'
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function uid() {
  return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function ensureDemoUser() {
  const users = read(KEYS.users, [])
  if (users.length === 0) {
    users.push({
      id: uid(),
      email: 'admin@nexusjr.com',
      password: 'nexus123'
    })
    write(KEYS.users, users)
  }
}
ensureDemoUser()

export const localAuth = {
  async signIn(email, password) {
    const users = read(KEYS.users, [])
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!user) {
      const err = new Error('E-mail ou senha incorretos.')
      err.code = 'invalid_credentials'
      throw err
    }
    const session = { user: { id: user.id, email: user.email } }
    write(KEYS.session, session)
    return session
  },
  async signUp(email, password) {
    const users = read(KEYS.users, [])
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Este e-mail ja esta cadastrado.')
    }
    const user = { id: uid(), email, password }
    users.push(user)
    write(KEYS.users, users)
    const session = { user: { id: user.id, email: user.email } }
    write(KEYS.session, session)
    return session
  },
  async signOut() {
    localStorage.removeItem(KEYS.session)
  },
  async getSession() {
    return read(KEYS.session, null)
  }
}

function ownerScope(user) {
  if (!user) throw new Error('Sessao expirada.')
  return user.id
}

export const localDB = {
  // Clientes
  async listClients(user) {
    const owner = ownerScope(user)
    return read(KEYS.clients, []).filter((c) => c.user_id === owner)
  },
  async addClient(user, payload) {
    const owner = ownerScope(user)
    const all = read(KEYS.clients, [])
    const row = {
      id: uid(),
      user_id: owner,
      name: payload.name,
      phone: payload.phone || '',
      plan_id: payload.plan_id,
      plan_value: Number(payload.plan_value),
      used_coupon: Boolean(payload.used_coupon),
      coupon_value: Number(payload.coupon_value || 0),
      expires_at: payload.expires_at || null,
      created_at: new Date().toISOString()
    }
    all.push(row)
    write(KEYS.clients, all)
    return row
  },
  async updateClient(user, id, payload) {
    const owner = ownerScope(user)
    const all = read(KEYS.clients, [])
    const idx = all.findIndex((c) => c.id === id && c.user_id === owner)
    if (idx === -1) throw new Error('Cliente nao encontrado.')
    all[idx] = {
      ...all[idx],
      name: payload.name,
      phone: payload.phone || '',
      plan_id: payload.plan_id,
      plan_value: Number(payload.plan_value),
      used_coupon: Boolean(payload.used_coupon),
      coupon_value: Number(payload.coupon_value || 0),
      ...(payload.expires_at !== undefined ? { expires_at: payload.expires_at } : {})
    }
    write(KEYS.clients, all)
    return all[idx]
  },
  async removeClient(user, id) {
    const owner = ownerScope(user)
    const all = read(KEYS.clients, []).filter((c) => !(c.id === id && c.user_id === owner))
    write(KEYS.clients, all)
  },

  // Lancamentos
  async listEntries(user) {
    const owner = ownerScope(user)
    return read(KEYS.entries, []).filter((e) => e.user_id === owner)
  },
  async addEntry(user, payload) {
    const owner = ownerScope(user)
    const all = read(KEYS.entries, [])
    const row = {
      id: uid(),
      user_id: owner,
      description: payload.description,
      value: Number(payload.value),
      type: payload.type,
      created_at: new Date().toISOString()
    }
    all.push(row)
    write(KEYS.entries, all)
    return row
  },
  async removeEntry(user, id) {
    const owner = ownerScope(user)
    const all = read(KEYS.entries, []).filter((e) => !(e.id === id && e.user_id === owner))
    write(KEYS.entries, all)
  }
}
