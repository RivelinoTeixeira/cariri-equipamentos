import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { clientsApi, entriesApi } from '../services/api'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)

// ============================
// REGRAS DE NEGOCIO - NexusJR
// ============================
export const FIXED_COST = 90 // R$ 90,00 / mes (custos fixos da empresa)
export const COST_PER_CLIENT = 10 // R$ 10,00 / cliente ativo
export const COUPON_DISCOUNT = 5 // R$ 5,00 de desconto quando cliente usa cupom

export const PLANS = [
  { id: 'mensal_1', label: 'Mensal', value: 19.9 },
  { id: 'mensal_2', label: 'Trimestral', value: 49.9 },
  { id: 'anual', label: 'Anual', value: 149.9 }
]

export function planById(id) {
  return PLANS.find((p) => p.id === id)
}

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setClients([])
      setEntries([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [c, e] = await Promise.all([
        clientsApi.list(user),
        entriesApi.list(user)
      ])
      setClients(c || [])
      setEntries(e || [])
    } catch (err) {
      setError(err.message || 'Falha ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addClient(payload) {
    const row = await clientsApi.create(user, payload)
    setClients((prev) => [row, ...prev])
  }

  async function updateClient(id, payload) {
    const row = await clientsApi.update(user, id, payload)
    setClients((prev) => prev.map((c) => (c.id === id ? row : c)))
  }

  async function removeClient(id) {
    await clientsApi.remove(user, id)
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  async function addEntry(payload) {
    const row = await entriesApi.create(user, payload)
    setEntries((prev) => [row, ...prev])
  }

  async function removeEntry(id) {
    await entriesApi.remove(user, id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  // ============================
  // CALCULOS DINAMICOS
  // ============================
  const metrics = useMemo(() => {
    const activeClients = clients.length
    const clientsRevenue = clients.reduce(
      (acc, c) => acc + Number(c.plan_value || 0),
      0
    )
    const extraIncome = entries
      .filter((e) => e.type === 'income')
      .reduce((acc, e) => acc + Number(e.value || 0), 0)
    const extraExpense = entries
      .filter((e) => e.type === 'expense')
      .reduce((acc, e) => acc + Number(e.value || 0), 0)

    const grossRevenue = clientsRevenue + extraIncome
    const totalExpense = FIXED_COST + activeClients * COST_PER_CLIENT + extraExpense
    const netProfit = grossRevenue - totalExpense

    return {
      activeClients,
      clientsRevenue,
      extraIncome,
      extraExpense,
      grossRevenue,
      totalExpense,
      netProfit
    }
  }, [clients, entries])

  return (
    <DataContext.Provider
      value={{
        clients,
        entries,
        loading,
        error,
        metrics,
        addClient,
        updateClient,
        removeClient,
        addEntry,
        removeEntry,
        refresh
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData deve ser usado dentro de <DataProvider>')
  return ctx
}
