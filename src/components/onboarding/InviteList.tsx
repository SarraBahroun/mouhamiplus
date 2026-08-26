'use client'

import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { useLang } from '@/providers/LangProvider'

export interface InviteRow {
  id: number
  name: string
  email: string
  role: string
  /** Superviseur requis pour un stagiaire : 'self' (la personne qui s'inscrit) ou l'id d'une autre ligne de cette liste. */
  supervisorRowId?: 'self' | number | ''
}

export function InviteList({
  rows,
  setRows,
  roleOptions,
  addLabel,
  supervisableRoles = [],
}: {
  rows: InviteRow[]
  setRows: (rows: InviteRow[]) => void
  roleOptions: { value: string; label: string }[]
  addLabel?: string
  /** Rôles (parmi roleOptions) qui comptent comme superviseurs possibles pour un stagiaire. */
  supervisableRoles?: string[]
}) {
  const { tr } = useLang()
  const resolvedAddLabel = addLabel ?? tr.invite_add_member_label
  const update = (id: number, patch: Partial<InviteRow>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  const remove = (id: number) => setRows(rows.filter((r) => r.id !== id))

  const add = () => {
    const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1
    setRows([...rows, { id: nextId, name: '', email: '', role: roleOptions[0]?.value ?? '' }])
  }

  const supervisorOptions = (currentRowId: number) => [
    { value: '', label: tr.invite_select_placeholder },
    { value: 'self', label: tr.invite_self },
    ...rows
      .filter((r) => r.id !== currentRowId && supervisableRoles.includes(r.role))
      .map((r) => ({ value: String(r.id), label: r.name.trim() || tr.invite_unnamed_lawyer })),
  ]

  return (
    <div className="flex flex-col gap-3">
      {rows.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
          {tr.invite_empty}
        </p>
      )}
      {rows.map((row) => (
        <div
          key={row.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: '10px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'var(--color-secondary)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 140px 32px',
              gap: 8,
              alignItems: 'end',
            }}
          >
            <Input label={tr.invite_name_label} value={row.name} onChange={(v) => update(row.id, { name: v })} placeholder={tr.invite_name_placeholder} />
            <Input label={tr.invite_email_label} type="email" value={row.email} onChange={(v) => update(row.id, { email: v })} placeholder={tr.invite_email_placeholder} />
            <SelectInput label={tr.invite_role_label} value={row.role} onChange={(v) => update(row.id, { role: v })} options={roleOptions} />
            <button
              onClick={() => remove(row.id)}
              title={tr.invite_remove_title}
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
          {supervisableRoles.length > 0 && row.role === 'intern' && (
            <SelectInput
              label={tr.invite_supervisor_label}
              value={String(row.supervisorRowId ?? '')}
              onChange={(v) => update(row.id, { supervisorRowId: v === 'self' ? 'self' : v ? Number(v) : '' })}
              options={supervisorOptions(row.id)}
            />
          )}
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
        {resolvedAddLabel}
      </button>
    </div>
  )
}
