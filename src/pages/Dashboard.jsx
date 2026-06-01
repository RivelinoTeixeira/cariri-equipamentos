import { useEffect, useState } from 'react'
import Topbar from '../components/Topbar'
import Card from '../components/Card'
import MetricCard from '../components/MetricCard'
import Modal from '../components/Modal'
import Button from '../components/Button'
import ResponsiveTable from '../components/ResponsiveTable'
import { Field, Input, Select } from '../components/Input'
import {
  PLANS,
  planById,
  useData,
  FIXED_COST,
  COST_PER_CLIENT,
  COUPON_DISCOUNT,
  computeNextExpiry
} from '../context/DataContext'
import { formatBRL, formatDate, parseMoneyInput } from '../utils/format'

// Retorna { label, tone, days } a partir de um ISO de vencimento
function expiryStatus(iso) {
  if (!iso) return { label: 'Sem vencimento', tone: 'muted', days: null }
  const now = new Date()
  const exp = new Date(iso)
  const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { label: `Vencido ha ${-days}d`, tone: 'danger', days }
  if (days === 0) return { label: 'Vence hoje', tone: 'warning', days }
  if (days <= 7) return { label: `Vence em ${days}d`, tone: 'warning', days }
  return { label: `${days}d restantes`, tone: 'success', days }
}

const STATUS_CLASSES = {
  muted:
    'text-nexus-muted border-nexus-border bg-nexus-surface',
  danger:
    'text-nexus-danger border-nexus-danger/40 bg-nexus-danger/10',
  warning:
    'text-amber-400 border-amber-400/40 bg-amber-400/10',
  success:
    'text-nexus-success border-nexus-success/40 bg-nexus-success/10'
}

// ------------- icones inline -------------
const Icon = {
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  money: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  expense: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  ),
  profit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export default function Dashboard() {
  const {
    clients,
    entries,
    metrics,
    loading,
    error,
    addClient,
    updateClient,
    renewClient,
    removeClient,
    addEntry,
    removeEntry
  } = useData()

  const [clientModal, setClientModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [renewingClient, setRenewingClient] = useState(null)
  const [entryModal, setEntryModal] = useState(false)

  // Ordena clientes por vencimento (mais proximo primeiro), sem data no fim
  const sortedClients = [...clients].sort((a, b) => {
    if (!a.expires_at && !b.expires_at) return 0
    if (!a.expires_at) return 1
    if (!b.expires_at) return -1
    return new Date(a.expires_at) - new Date(b.expires_at)
  })

  return (
    <div className="min-h-screen bg-nexus-bg text-nexus-text">
      {/* halo de fundo */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-96 w-96 rounded-full bg-nexus-purple/20 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-96 w-96 rounded-full bg-nexus-cyan/15 blur-3xl" />

      <Topbar />

      <main className="relative max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24">
        {/* Cabecalho */}
        <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Visao geral
            </h1>
            <p className="text-sm text-nexus-muted">
              Acompanhamento em tempo real do fluxo de caixa.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={() => setEntryModal(true)}
              icon={Icon.plus}
              className="w-full sm:w-auto"
            >
              Lancamento
            </Button>
            <Button
              onClick={() => setClientModal(true)}
              icon={Icon.plus}
              className="w-full sm:w-auto"
            >
              Novo cliente
            </Button>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-nexus-danger/40 bg-nexus-danger/10 text-nexus-danger text-sm px-4 py-3">
            {error}
          </div>
        )}

        {/* Metricas - 2 colunas no mobile p/ aproveitar a tela */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            label="Clientes ativos"
            value={String(metrics.activeClients)}
            hint={`Custo por cliente ${formatBRL(COST_PER_CLIENT)} / mes`}
            icon={Icon.users}
            tone="purple"
          />
          <MetricCard
            label="Faturamento bruto"
            value={metrics.grossRevenue}
            hint={`${formatBRL(metrics.clientsRevenue)} planos + ${formatBRL(
              metrics.extraIncome
            )} extras`}
            icon={Icon.money}
            tone="cyan"
          />
          <MetricCard
            label="Gastos totais"
            value={metrics.totalExpense}
            hint={`Fixos ${formatBRL(FIXED_COST)} + clientes + extras`}
            icon={Icon.expense}
            tone="danger"
          />
          <MetricCard
            label="Lucro liquido"
            value={metrics.netProfit}
            hint={
              metrics.netProfit >= 0
                ? 'Operacao saudavel'
                : 'Atencao: prejuizo no periodo'
            }
            icon={Icon.profit}
            tone={metrics.netProfit >= 0 ? 'success' : 'danger'}
          />
        </section>

        {/* Dashboard de composicao */}
        <CompositionPanel metrics={metrics} />


        {/* Clientes */}
        <Card
          subtitle="Carteira"
          title={`Clientes (${clients.length})`}
          accent="purple"
        >
          <ResponsiveTable
            columns={[
              { key: 'name', label: 'Nome' },
              { key: 'phone', label: 'Telefone', render: (r) => r.phone || '-' },
              {
                key: 'plan_id',
                label: 'Plano',
                render: (r) => {
                  const couponV = Number(r.coupon_value || 0)
                  return (
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{planById(r.plan_id)?.label || r.plan_id}</span>
                      {r.used_coupon && couponV > 0 && (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-nexus-purple/50 bg-nexus-purple/10 text-nexus-purple">
                          Cupom -{formatBRL(couponV)}
                        </span>
                      )}
                    </div>
                  )
                }
              },
              {
                key: 'plan_value',
                label: 'Valor',
                render: (r) => {
                  const couponV = Number(r.coupon_value || 0)
                  const hasDiscount = r.used_coupon && couponV > 0
                  const original = hasDiscount
                    ? Number(r.plan_value) + couponV
                    : null
                  return (
                    <div className="flex flex-col items-end sm:items-start">
                      <span className="font-semibold text-nexus-cyan">
                        {formatBRL(r.plan_value)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[11px] text-nexus-muted line-through">
                          {formatBRL(original)}
                        </span>
                      )}
                    </div>
                  )
                }
              },
              {
                key: 'expires_at',
                label: 'Vencimento',
                render: (r) => {
                  const st = expiryStatus(r.expires_at)
                  return (
                    <div className="flex flex-col items-end sm:items-start gap-1">
                      <span className="text-nexus-text text-sm">
                        {r.expires_at ? formatDate(r.expires_at) : '-'}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${STATUS_CLASSES[st.tone]}`}
                      >
                        {st.label}
                      </span>
                    </div>
                  )
                }
              }
            ]}
            rows={sortedClients}
            onRenew={(row) => setRenewingClient(row)}
            onEdit={(row) => setEditingClient(row)}
            onDelete={(row) => {
              if (confirm(`Excluir cliente "${row.name}"?`)) removeClient(row.id)
            }}
            emptyMessage="Nenhum cliente cadastrado. Clique em 'Novo cliente'."
          />
        </Card>

        {/* Lancamentos */}
        <Card
          subtitle="Movimentacao"
          title={`Lancamentos manuais (${entries.length})`}
          accent="cyan"
        >
          <ResponsiveTable
            columns={[
              { key: 'description', label: 'Descricao' },
              {
                key: 'type',
                label: 'Tipo',
                render: (r) => (
                  <span
                    className={`text-[11px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full border ${
                      r.type === 'income'
                        ? 'text-nexus-success border-nexus-success/40 bg-nexus-success/10'
                        : 'text-nexus-danger border-nexus-danger/40 bg-nexus-danger/10'
                    }`}
                  >
                    {r.type === 'income' ? 'Ganho extra' : 'Gasto extra'}
                  </span>
                )
              },
              {
                key: 'value',
                label: 'Valor',
                render: (r) => (
                  <span
                    className={`font-semibold ${
                      r.type === 'income' ? 'text-nexus-success' : 'text-nexus-danger'
                    }`}
                  >
                    {r.type === 'income' ? '+ ' : '- '}
                    {formatBRL(r.value)}
                  </span>
                )
              },
              {
                key: 'created_at',
                label: 'Data',
                render: (r) => formatDate(r.created_at)
              }
            ]}
            rows={entries}
            onDelete={(row) => {
              if (confirm(`Excluir lancamento "${row.description}"?`))
                removeEntry(row.id)
            }}
            emptyMessage="Nenhum lancamento manual. Clique em 'Lancamento'."
          />
        </Card>

        {loading && (
          <div className="fixed bottom-4 right-4 rounded-xl bg-nexus-card border border-nexus-border px-3 py-2 text-xs text-nexus-muted flex items-center gap-2">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-nexus-purple/40 border-t-nexus-purple" />
            Atualizando...
          </div>
        )}
      </main>

      <ClientModal
        open={clientModal || Boolean(editingClient)}
        editing={editingClient}
        onClose={() => {
          setClientModal(false)
          setEditingClient(null)
        }}
        onSubmit={async (payload) => {
          if (editingClient) {
            await updateClient(editingClient.id, payload)
          } else {
            await addClient(payload)
          }
        }}
      />
      <RenewModal
        open={Boolean(renewingClient)}
        client={renewingClient}
        onClose={() => setRenewingClient(null)}
        onSubmit={async (payload) => {
          await renewClient(renewingClient.id, payload)
        }}
      />
      <EntryModal
        open={entryModal}
        onClose={() => setEntryModal(false)}
        onSubmit={addEntry}
      />
    </div>
  )
}

// ----------------- Dashboard de composicao (barras) -----------------
function CompositionPanel({ metrics }) {
  const margin =
    metrics.grossRevenue > 0
      ? (metrics.netProfit / metrics.grossRevenue) * 100
      : 0

  const max = Math.max(
    metrics.grossRevenue,
    metrics.totalExpense,
    Math.abs(metrics.netProfit),
    1
  )

  const incomeSegments = [
    { value: metrics.clientsRevenue, color: '#22D3EE', label: 'Planos' },
    { value: metrics.extraIncome, color: '#06B6D4', label: 'Ganhos extras' }
  ]
  const expenseSegments = [
    { value: FIXED_COST, color: '#7C3AED', label: 'Custos fixos' },
    {
      value: metrics.activeClients * COST_PER_CLIENT,
      color: '#A855F7',
      label: 'Por cliente'
    },
    { value: metrics.extraExpense, color: '#C084FC', label: 'Gastos extras' }
  ]
  const profitSegments = [
    {
      value: Math.abs(metrics.netProfit),
      color: metrics.netProfit >= 0 ? '#22C55E' : '#EF4444',
      label: metrics.netProfit >= 0 ? 'Lucro' : 'Prejuizo'
    }
  ]

  const marginTone =
    margin > 30
      ? 'text-nexus-success bg-nexus-success/10 border-nexus-success/40'
      : margin >= 0
      ? 'text-nexus-cyan bg-nexus-cyan/10 border-nexus-cyan/40'
      : 'text-nexus-danger bg-nexus-danger/10 border-nexus-danger/40'

  return (
    <Card subtitle="Composicao" title="Dashboard do mês" accent="neutral">
      <div className="flex items-center justify-between mb-4 -mt-1">
        <div className="text-xs text-nexus-muted">
          Comparacao visual de receitas, gastos e resultado.
        </div>
        <div
          className={`text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${marginTone}`}
        >
          Margem {margin.toFixed(1)}%
        </div>
      </div>

      <div className="space-y-5">
        <BarBlock
          label="Faturamento bruto"
          total={metrics.grossRevenue}
          totalColor="text-nexus-cyan"
          segments={incomeSegments}
          max={max}
        />
        <BarBlock
          label="Gastos totais"
          total={metrics.totalExpense}
          totalColor="text-nexus-danger"
          segments={expenseSegments}
          max={max}
        />
        <BarBlock
          label="Lucro liquido"
          total={metrics.netProfit}
          totalColor={
            metrics.netProfit >= 0 ? 'text-nexus-success' : 'text-nexus-danger'
          }
          segments={profitSegments}
          max={max}
        />
      </div>
    </Card>
  )
}

function BarBlock({ label, total, totalColor, segments, max }) {
  const visibleSegments = segments.filter((s) => Number(s.value) > 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wider text-nexus-muted font-semibold">
          {label}
        </div>
        <div className={`text-base sm:text-lg font-extrabold ${totalColor}`}>
          {formatBRL(total)}
        </div>
      </div>

      <div className="relative h-3 rounded-full bg-nexus-surface border border-nexus-border overflow-hidden flex">
        {visibleSegments.map((seg, i) => {
          const w = (Number(seg.value) / max) * 100
          return (
            <div
              key={i}
              className="h-full transition-all duration-500"
              style={{ width: `${w}%`, backgroundColor: seg.color }}
              title={`${seg.label}: ${formatBRL(seg.value)}`}
            />
          )
        })}
      </div>

      {visibleSegments.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px]">
          {visibleSegments.map((seg, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-nexus-muted">{seg.label}</span>
              <span className="text-nexus-text font-semibold">
                {formatBRL(seg.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ----------------- Modal de cliente (criar / editar) -----------------
function ClientModal({ open, onClose, onSubmit, editing }) {
  const isEdit = Boolean(editing)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [planId, setPlanId] = useState(PLANS[0].id)
  const [valueStr, setValueStr] = useState(formatMoneyInput(PLANS[0].value))
  const [usedCoupon, setUsedCoupon] = useState(false)
  const [couponStr, setCouponStr] = useState(formatMoneyInput(COUPON_DISCOUNT))
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  // Prefill quando abrir (criar OU editar)
  useEffect(() => {
    if (!open) return
    if (editing) {
      const stored = Number(editing.plan_value || 0)
      const storedCoupon = Number(editing.coupon_value || 0)
      // valor base (antes do desconto) = armazenado + desconto se houve cupom
      const base = editing.used_coupon ? stored + storedCoupon : stored
      setName(editing.name || '')
      setPhone(editing.phone || '')
      setPlanId(editing.plan_id || PLANS[0].id)
      setValueStr(formatMoneyInput(base))
      setUsedCoupon(Boolean(editing.used_coupon))
      setCouponStr(
        formatMoneyInput(storedCoupon > 0 ? storedCoupon : COUPON_DISCOUNT)
      )
    } else {
      setName('')
      setPhone('')
      setPlanId(PLANS[0].id)
      setValueStr(formatMoneyInput(PLANS[0].value))
      setUsedCoupon(false)
      setCouponStr(formatMoneyInput(COUPON_DISCOUNT))
    }
    setErr(null)
  }, [open, editing])

  const plan = planById(planId)
  const baseValue = parseMoneyInput(valueStr)
  const couponValue = usedCoupon ? Math.max(0, parseMoneyInput(couponStr)) : 0
  const finalValue = Math.max(0, baseValue - couponValue)

  function handlePlanChange(newPlanId) {
    const oldPlan = planById(planId)
    const newPlan = planById(newPlanId)
    const cur = parseMoneyInput(valueStr)
    // se o valor atual ainda e o "padrao" do plano anterior, atualiza para o do novo
    if (oldPlan && Math.abs(cur - oldPlan.value) < 0.005) {
      setValueStr(formatMoneyInput(newPlan.value))
    }
    setPlanId(newPlanId)
  }

  async function handleSubmit(e) {
    e?.preventDefault?.()
    if (!name.trim()) {
      setErr('Informe o nome do cliente.')
      return
    }
    if (baseValue < 0) {
      setErr('Valor invalido.')
      return
    }
    setSaving(true)
    setErr(null)
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        plan_id: planId,
        plan_value: finalValue,
        used_coupon: usedCoupon,
        coupon_value: couponValue
      })
      onClose()
    } catch (e) {
      setErr(e.message || 'Falha ao salvar cliente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar cliente' : 'Novo cliente'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? 'Salvar alteracoes' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome do cliente">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Joao da Silva"
            required
          />
        </Field>
        <Field label="Telefone">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-0000"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Plano">
            <Select
              value={planId}
              onChange={(e) => handlePlanChange(e.target.value)}
            >
              {PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} - {formatBRL(p.value)}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Valor cobrado (R$)"
            hint="Ajuste se for mes gratis (0,00) ou valor diferente."
          >
            <Input
              inputMode="decimal"
              value={valueStr}
              onChange={(e) => setValueStr(e.target.value)}
              placeholder="19,90"
            />
          </Field>
        </div>

        {/* Caixinha de Cupom (com desconto editavel) */}
        <div
          className={`rounded-xl border p-3 transition ${
            usedCoupon
              ? 'border-nexus-purple bg-nexus-purple/10'
              : 'border-nexus-border bg-nexus-surface/60'
          }`}
        >
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={usedCoupon}
              onChange={(e) => setUsedCoupon(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded-md accent-nexus-purple shrink-0"
            />
            <div className="flex-1">
              <div className="text-sm font-semibold text-nexus-text">
                Cliente usou cupom de desconto
              </div>
              <div className="text-xs text-nexus-muted mt-0.5">
                Marque para aplicar e ajustar o valor do desconto abaixo.
              </div>
            </div>
          </label>

          {usedCoupon && (
            <div className="mt-3 pl-8 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs text-nexus-muted">
                  Desconto (R$):
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={couponStr}
                  onChange={(e) => setCouponStr(e.target.value)}
                  placeholder="5,00"
                  className="w-28 rounded-lg bg-nexus-surface border border-nexus-border px-2.5 py-1.5 text-sm text-nexus-text outline-none transition focus:border-nexus-purple focus:ring-2 focus:ring-nexus-purple/30"
                />
              </div>
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="text-nexus-muted">Valor final:</span>
                <span className="font-bold text-nexus-cyan text-sm">
                  {formatBRL(finalValue)}
                </span>
                {baseValue > 0 && couponValue > 0 && (
                  <span className="text-nexus-muted line-through">
                    {formatBRL(baseValue)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-[11px] text-nexus-muted">
          Lembrete: cada cliente ativo gera custo de {formatBRL(COST_PER_CLIENT)} / mes pra empresa.
        </div>

        {err && (
          <div className="rounded-xl border border-nexus-danger/40 bg-nexus-danger/10 text-nexus-danger text-sm px-3 py-2">
            {err}
          </div>
        )}
      </form>
    </Modal>
  )
}

function formatMoneyInput(n) {
  return Number(n || 0).toFixed(2).replace('.', ',')
}

// ----------------- Modal de lancamento -----------------
function EntryModal({ open, onClose, onSubmit }) {
  const [description, setDescription] = useState('')
  const [valueStr, setValueStr] = useState('')
  const [type, setType] = useState('expense')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  function reset() {
    setDescription('')
    setValueStr('')
    setType('expense')
    setErr(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const value = parseMoneyInput(valueStr)
    if (!description.trim()) {
      setErr('Informe uma descricao.')
      return
    }
    if (value <= 0) {
      setErr('Informe um valor maior que zero.')
      return
    }
    setSaving(true)
    setErr(null)
    try {
      await onSubmit({ description: description.trim(), value, type })
      reset()
      onClose()
    } catch (e) {
      setErr(e.message || 'Falha ao salvar lancamento.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title="Novo lancamento manual"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              reset()
              onClose()
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            Salvar
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Descricao / Tag">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Patrocinio, Energia, Marketing..."
            required
          />
        </Field>
        <Field label="Valor (R$)">
          <Input
            inputMode="decimal"
            value={valueStr}
            onChange={(e) => setValueStr(e.target.value)}
            placeholder="Ex: 199,90"
            required
          />
        </Field>
        <Field label="Tipo">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                type === 'expense'
                  ? 'border-nexus-danger text-nexus-danger bg-nexus-danger/10'
                  : 'border-nexus-border text-nexus-muted hover:text-nexus-text'
              }`}
            >
              Gasto extra
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                type === 'income'
                  ? 'border-nexus-success text-nexus-success bg-nexus-success/10'
                  : 'border-nexus-border text-nexus-muted hover:text-nexus-text'
              }`}
            >
              Ganho extra
            </button>
          </div>
        </Field>
        {err && (
          <div className="rounded-xl border border-nexus-danger/40 bg-nexus-danger/10 text-nexus-danger text-sm px-3 py-2">
            {err}
          </div>
        )}
      </form>
    </Modal>
  )
}

// ----------------- Modal de renovacao -----------------
function RenewModal({ open, client, onClose, onSubmit }) {
  const [planId, setPlanId] = useState(PLANS[0].id)
  const [valueStr, setValueStr] = useState(formatMoneyInput(PLANS[0].value))
  const [usedCoupon, setUsedCoupon] = useState(false)
  const [couponStr, setCouponStr] = useState(formatMoneyInput(COUPON_DISCOUNT))
  const [registerIncome, setRegisterIncome] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  // Prefill com dados atuais do cliente quando o modal abrir
  useEffect(() => {
    if (!open || !client) return
    const stored = Number(client.plan_value || 0)
    const storedCoupon = Number(client.coupon_value || 0)
    const base = client.used_coupon ? stored + storedCoupon : stored
    setPlanId(client.plan_id || PLANS[0].id)
    setValueStr(formatMoneyInput(base))
    setUsedCoupon(Boolean(client.used_coupon))
    setCouponStr(
      formatMoneyInput(storedCoupon > 0 ? storedCoupon : COUPON_DISCOUNT)
    )
    setRegisterIncome(true)
    setErr(null)
  }, [open, client])

  if (!client) return null

  const currentStatus = expiryStatus(client.expires_at)
  const baseValue = parseMoneyInput(valueStr)
  const couponValue = usedCoupon ? Math.max(0, parseMoneyInput(couponStr)) : 0
  const finalValue = Math.max(0, baseValue - couponValue)
  const newExpiryIso = computeNextExpiry(client.expires_at, planId)
  const newExpiryStatus = expiryStatus(newExpiryIso)

  function handlePlanChange(newPlanId) {
    const oldPlan = planById(planId)
    const newPlan = planById(newPlanId)
    const cur = parseMoneyInput(valueStr)
    if (oldPlan && Math.abs(cur - oldPlan.value) < 0.005) {
      setValueStr(formatMoneyInput(newPlan.value))
    }
    setPlanId(newPlanId)
  }

  async function handleSubmit(e) {
    e?.preventDefault?.()
    if (baseValue < 0) {
      setErr('Valor invalido.')
      return
    }
    setSaving(true)
    setErr(null)
    try {
      await onSubmit({
        plan_id: planId,
        plan_value: finalValue,
        used_coupon: usedCoupon,
        coupon_value: couponValue,
        register_income: registerIncome
      })
      onClose()
    } catch (e) {
      setErr(e.message || 'Falha ao renovar cliente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Renovar: ${client.name}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            Confirmar renovacao
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Situacao atual */}
        <div className="rounded-xl border border-nexus-border bg-nexus-surface/60 p-3 space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-nexus-muted font-semibold">
            Situacao atual
          </div>
          <div className="text-sm">
            Plano: <span className="font-semibold">{planById(client.plan_id)?.label || client.plan_id}</span>
            {' · '}
            Valor: <span className="font-semibold text-nexus-cyan">{formatBRL(client.plan_value)}</span>
            {client.used_coupon && Number(client.coupon_value) > 0 && (
              <span className="text-nexus-purple"> (cupom -{formatBRL(client.coupon_value)})</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-nexus-muted">Vencimento:</span>
            <span>{client.expires_at ? formatDate(client.expires_at) : '-'}</span>
            <span
              className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${STATUS_CLASSES[currentStatus.tone]}`}
            >
              {currentStatus.label}
            </span>
          </div>
        </div>

        {/* Configuracao da renovacao */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Plano da renovacao">
            <Select
              value={planId}
              onChange={(e) => handlePlanChange(e.target.value)}
            >
              {PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} - {formatBRL(p.value)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Valor cobrado (R$)">
            <Input
              inputMode="decimal"
              value={valueStr}
              onChange={(e) => setValueStr(e.target.value)}
              placeholder="19,90"
            />
          </Field>
        </div>

        {/* Cupom */}
        <div
          className={`rounded-xl border p-3 transition ${
            usedCoupon
              ? 'border-nexus-purple bg-nexus-purple/10'
              : 'border-nexus-border bg-nexus-surface/60'
          }`}
        >
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={usedCoupon}
              onChange={(e) => setUsedCoupon(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded-md accent-nexus-purple shrink-0"
            />
            <div className="flex-1">
              <div className="text-sm font-semibold text-nexus-text">
                Usou cupom nesta renovacao
              </div>
              <div className="text-xs text-nexus-muted mt-0.5">
                Marque e ajuste o desconto abaixo.
              </div>
            </div>
          </label>
          {usedCoupon && (
            <div className="mt-3 pl-8 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs text-nexus-muted">Desconto (R$):</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={couponStr}
                  onChange={(e) => setCouponStr(e.target.value)}
                  placeholder="5,00"
                  className="w-28 rounded-lg bg-nexus-surface border border-nexus-border px-2.5 py-1.5 text-sm text-nexus-text outline-none transition focus:border-nexus-purple focus:ring-2 focus:ring-nexus-purple/30"
                />
              </div>
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="text-nexus-muted">Valor final:</span>
                <span className="font-bold text-nexus-cyan text-sm">
                  {formatBRL(finalValue)}
                </span>
                {baseValue > 0 && couponValue > 0 && (
                  <span className="text-nexus-muted line-through">
                    {formatBRL(baseValue)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Apos confirmar */}
        <div className="rounded-xl border border-nexus-success/40 bg-nexus-success/5 p-3 space-y-2">
          <div className="text-[11px] uppercase tracking-wider text-nexus-success font-semibold">
            Apos confirmar
          </div>
          <div className="text-sm flex items-center gap-2 flex-wrap">
            <span>Novo vencimento:</span>
            <span className="font-bold">{formatDate(newExpiryIso)}</span>
            <span
              className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${STATUS_CLASSES[newExpiryStatus.tone]}`}
            >
              {newExpiryStatus.label}
            </span>
          </div>
          <div className="text-sm">
            Valor cobrado:{' '}
            <span className="font-bold text-nexus-cyan">{formatBRL(finalValue)}</span>
          </div>
        </div>

        {/* Registrar como receita */}
        <label
          className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition select-none ${
            registerIncome
              ? 'border-nexus-success bg-nexus-success/10'
              : 'border-nexus-border bg-nexus-surface/60'
          }`}
        >
          <input
            type="checkbox"
            checked={registerIncome}
            onChange={(e) => setRegisterIncome(e.target.checked)}
            className="mt-0.5 h-5 w-5 rounded-md accent-nexus-success shrink-0"
          />
          <div className="flex-1">
            <div className="text-sm font-semibold text-nexus-text">
              Registrar pagamento como receita
            </div>
            <div className="text-xs text-nexus-muted mt-0.5">
              Cria lancamento "Renovacao - {client.name}" no valor de{' '}
              <span className="font-semibold text-nexus-cyan">
                {formatBRL(finalValue)}
              </span>
              .
            </div>
          </div>
        </label>

        {err && (
          <div className="rounded-xl border border-nexus-danger/40 bg-nexus-danger/10 text-nexus-danger text-sm px-3 py-2">
            {err}
          </div>
        )}
      </form>
    </Modal>
  )
}
