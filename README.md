# NexusJR Stream — Dashboard de Gestão Interna

Dashboard web para gestão interna da empresa de streaming **NexusJR Stream**.
Construído com **React + Vite + Tailwind CSS** e autenticação/banco em
**Supabase** (com fallback local para preview imediato).

## 🚀 Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

### Modo local (preview imediato)

Se o arquivo `.env` estiver **vazio**, o app roda em **Modo Local** usando
`localStorage`. Já vem com uma conta demo:

- **E-mail:** `admin@nexusjr.com`
- **Senha:** `nexus123`

Você também pode clicar em **"Cadastre-se"** na tela de login para criar
qualquer outra conta local.

### Conectando ao Supabase

1. Crie um projeto grátis em https://supabase.com.
2. Em **Project Settings → API**, copie `Project URL` e `anon public key`.
3. Cole no arquivo `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
4. No **SQL Editor** do Supabase, rode o script abaixo para criar as tabelas e
   políticas de RLS (também presente em `src/services/supabase.js`):

```sql
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  plan_id text not null,
  plan_value numeric not null,
  created_at timestamptz default now()
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  value numeric not null,
  type text not null check (type in ('income','expense')),
  created_at timestamptz default now()
);

alter table public.clients enable row level security;
alter table public.entries enable row level security;

create policy "clients_owner" on public.clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "entries_owner" on public.entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

5. Reinicie `npm run dev`. O badge no topo passa de **"Modo Local"** para
   **"Supabase ON"**.

## 📁 Estrutura

```
my-nexus-app/
├── public/
├── src/
│   ├── assets/          # Logo da Nexus
│   ├── components/      # Button, Card, Modal, ResponsiveTable, Input, Topbar, ...
│   ├── context/         # AuthContext, DataContext
│   ├── pages/           # Login, Dashboard
│   ├── services/        # supabase.js, localBackend.js, api.js
│   ├── styles/          # index.css (Tailwind)
│   ├── utils/           # format.js
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
└── tailwind.config.js
```

## 📊 Regras de negócio

- Custos fixos da empresa: **R$ 90,00 / mês**
- Custo automático por cliente ativo: **R$ 10,00 / mês**
- Planos: **Mensal 1 R$ 19,90 · Mensal 2 R$ 49,90 · Anual R$ 149,90**

Cálculos em tempo real:

- `Faturamento Bruto = Σ planos + ganhos extras`
- `Gastos Totais = 90 + (clientes × 10) + gastos extras`
- `Lucro Líquido = Faturamento Bruto − Gastos Totais`  
  (verde se positivo, vermelho se negativo)
