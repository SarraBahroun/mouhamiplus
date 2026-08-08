'use client'

import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'

export interface InviteRow {
  id: number
  name: string
  email: string
  role: string
}

export function InviteList({
  rows,
  setRows,
  roleOptions,
  addLabel = '+ Ajouter un membre',
}: {
  rows: InviteRow[]
  setRows: (rows: InviteRow[]) => void
  roleOptions: { value: string; label: string }[]
  addLabel?: string
}) {
  const update = (id: number, patch: Partial<InviteRow>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  const remove = (id: number) => setRows(rows.filter((r) => r.id !== id))

  const add = () => {
    const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1
    setRows([...rows, { id: nextId, name: '', email: '', role: roleOptions[0]?.value ?? '' }])
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
          Aucun membre à inviter pour le moment.
        </p>
      )}
      {rows.map((row) => (
        <div
          key={row.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 140px 32px',
            gap: 8,
            alignItems: 'end',
            padding: '10px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'var(--color-secondary)',
          }}
        >
          <Input label="Nom" value={row.name} onChange={(v) => update(row.id, { name: v })} placeholder="Prénom Nom" />
          <Input label="E-mail" type="email" value={row.email} onChange={(v) => update(row.id, { email: v })} placeholder="membre@cabinet.tn" />
          <SelectInput label="Rôle" value={row.role} onChange={(v) => update(row.id, { role: v })} options={roleOptions} />
          <button
            onClick={() => remove(row.id)}
            title="Retirer"
            style={{
              width: 32,
              height: 40,
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              background: 'var(--color-card)',
              color: 'var(--color-muted-foreground)',
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={add}
        style={{
          alignSelf: 'flex-start',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--color-primary)',
          fontFamily: 'var(--font-body)',
          padding: 0,
        }}
      >
        {addLabel}
      </button>
    </div>
  )
}
