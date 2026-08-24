'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { MemberRole, MemberStatus } from '@/lib/members-data'
import { ClientType } from '@/lib/clients-data'
import { CaseStatus, CaseMessageDirection } from '@/lib/cases-data'
import { AppointmentRequestStatus } from '@/lib/appointment-requests'
import { InvoiceStatus, PaymentStatus, ContractStatus } from '@/lib/finance-data'
import { PermissionSet } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/client'
import { inviteMember, type InviteMemberInput, type InviteMemberResult } from '@/app/(app)/members/actions'

export interface Member {
  id: string
  firstName: string
  lastName: string
  role: MemberRole
  email: string
  phone: string
  status: MemberStatus
  supervisorId: string | null
  avatar: string
  joinedAt: string
  lastActive: string
}

export interface ClientNotificationPreferences {
  email: boolean
  sms: boolean
}

export interface Client {
  id: string
  name: string
  type: ClientType
  email: string
  phone: string
  address: string
  city: string
  createdAt: string
  lastActivity: string
  hasPortalAccess: boolean
  notificationPreferences: ClientNotificationPreferences
}

export interface CaseDocument {
  id: string
  name: string
  type: string
  addedAt: string
  size: string
  storagePath: string | null
}

export interface CaseHearing {
  id: string
  date: string
  court: string
  note: string
}

export interface CaseNote {
  id: string
  author: string
  date: string
  text: string
}

export interface CaseTask {
  id: string
  label: string
  done: boolean
  dueDate: string
}

export interface CaseMessage {
  id: string
  author: string
  date: string
  text: string
  direction: CaseMessageDirection
}

export interface Case {
  id: string
  reference: string
  title: string
  clientId: string
  status: CaseStatus
  practiceArea: string
  assignedTo: string | null
  openedAt: string
  nextHearing?: string
  documents: CaseDocument[]
  hearings: CaseHearing[]
  notes: CaseNote[]
  tasks: CaseTask[]
  messages: CaseMessage[]
}

export interface AppointmentRequest {
  id: string
  clientId: string
  caseId: string
  requestedDate: string
  proposedDate?: string
  note: string
  status: AppointmentRequestStatus
  createdAt: string
}

export interface AppNotification {
  id: string
  audience: 'cabinet' | 'client'
  text: string
  date: string
  read: boolean
  href: string
}

export interface Invoice {
  id: string
  number: string
  clientId: string
  caseId?: string
  amount: number
  vatRate: number
  stampDuty: number
  issuedAt: string
  dueAt?: string
  status: InvoiceStatus
}

export interface Payment {
  id: string
  clientId: string
  caseId?: string
  amount: number
  date: string
  method: string
  status: PaymentStatus
}

export interface Contract {
  id: string
  clientId: string
  title: string
  status: ContractStatus
  signedAt?: string
  expiresAt?: string
}

export interface Correspondence {
  id: string
  caseId: string | null
  direction: CaseMessageDirection
  subject: string
  recipient: string
  sentAt: string
}

export interface AuditLogEntry {
  id: string
  date: string
  actorId: string | null
  actorName: string
  actorRole: MemberRole | null
  action: string
  entity: string
  detailBefore: string | null
  detailAfter: string | null
}

type NewMemberInput = InviteMemberInput

interface NewClientInput {
  name: string
  type: ClientType
  email: string
  phone: string
  address: string
  city: string
}

interface NewCaseInput {
  title: string
  clientId: string
  practiceArea: string
  assignedTo: string
}

interface NewCaseHearingInput {
  date: string
  court: string
  note: string
}

interface NewAppointmentRequestInput {
  clientId: string
  caseId: string
  requestedDate: string
  note: string
}

interface NewInvoiceInput {
  number: string
  clientId: string
  caseId?: string
  amount: number
  vatRate: number
  stampDuty: number
  dueAt?: string
}

interface NewPaymentInput {
  clientId: string
  caseId?: string
  amount: number
  method: string
  status: PaymentStatus
}

interface NewContractInput {
  clientId: string
  title: string
  signedAt?: string
  expiresAt?: string
}

interface NewCorrespondenceInput {
  caseId?: string
  direction: CaseMessageDirection
  subject: string
  recipient: string
}

export type InviteMemberOutcome = InviteMemberResult

interface AppDataContextValue {
  loading: boolean
  members: Member[]
  addMember: (input: NewMemberInput) => Promise<InviteMemberOutcome>
  toggleMemberStatus: (id: string) => Promise<void>
  memberPermissionOverrides: Record<string, PermissionSet>
  setMemberPermissionOverride: (id: string, perms: PermissionSet | null) => Promise<void>

  clients: Client[]
  addClient: (input: NewClientInput) => Promise<string | null>

  cases: Case[]
  addCase: (input: NewCaseInput) => Promise<string | null>
  updateCaseStatus: (caseId: string, status: CaseStatus) => Promise<boolean>
  toggleCaseTask: (caseId: string, taskId: string) => Promise<void>
  addCaseTask: (caseId: string, label: string, dueDate?: string) => Promise<boolean>
  deleteCaseTask: (caseId: string, taskId: string) => Promise<boolean>
  addCaseDocument: (caseId: string, file: File) => Promise<boolean>
  getDocumentUrl: (storagePath: string) => Promise<string | null>
  addCaseNote: (caseId: string, author: string, text: string) => Promise<void>
  addCaseMessage: (caseId: string, author: string, text: string, direction: CaseMessageDirection) => Promise<void>
  addCaseHearing: (caseId: string, input: NewCaseHearingInput) => Promise<boolean>

  appointmentRequests: AppointmentRequest[]
  addAppointmentRequest: (input: NewAppointmentRequestInput) => Promise<void>
  updateAppointmentRequest: (id: string, patch: Partial<AppointmentRequest>) => Promise<void>

  notifications: AppNotification[]
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: (audience: 'cabinet' | 'client') => Promise<void>

  invoices: Invoice[]
  addInvoice: (input: NewInvoiceInput) => Promise<string | null>
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>

  payments: Payment[]
  addPayment: (input: NewPaymentInput) => Promise<string | null>

  contracts: Contract[]
  addContract: (input: NewContractInput) => Promise<string | null>
  updateContractStatus: (id: string, status: ContractStatus) => Promise<void>

  correspondence: Correspondence[]
  addCorrespondence: (input: NewCorrespondenceInput) => Promise<string | null>

  auditLog: AuditLogEntry[]

  refresh: () => Promise<void>
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

// ── Mappers : lignes Supabase (snake_case) → formes camelCase attendues par l'UI ──

function mapMember(row: Record<string, unknown>): Member {
  return {
    id: row.id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    role: row.role as MemberRole,
    email: row.email as string,
    phone: (row.phone as string) ?? '',
    status: row.status as MemberStatus,
    supervisorId: (row.supervisor_id as string) ?? null,
    avatar: (row.avatar as string) ?? '??',
    joinedAt: row.joined_at as string,
    lastActive: row.last_active as string,
  }
}

function mapClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as ClientType,
    email: (row.email as string) ?? '',
    phone: (row.phone as string) ?? '',
    address: (row.address as string) ?? '',
    city: (row.city as string) ?? '',
    createdAt: row.created_at as string,
    lastActivity: row.last_activity_at as string,
    hasPortalAccess: Boolean(row.auth_user_id),
    notificationPreferences: {
      email: (row.notification_preferences as { email?: boolean } | null)?.email ?? true,
      sms: (row.notification_preferences as { sms?: boolean } | null)?.sms ?? false,
    },
  }
}

function mapDocument(row: Record<string, unknown>): CaseDocument {
  return {
    id: row.id as string,
    name: row.name as string,
    type: (row.type as string) ?? '',
    addedAt: row.added_at as string,
    size: (row.size_label as string) ?? '',
    storagePath: (row.storage_path as string) ?? null,
  }
}
function mapHearing(row: Record<string, unknown>): CaseHearing {
  return { id: row.id as string, date: row.date as string, court: (row.court as string) ?? '', note: (row.note as string) ?? '' }
}
function mapNote(row: Record<string, unknown>): CaseNote {
  return { id: row.id as string, author: (row.author_label as string) ?? '', date: row.date as string, text: row.text as string }
}
function mapTask(row: Record<string, unknown>): CaseTask {
  return { id: row.id as string, label: row.label as string, done: row.done as boolean, dueDate: row.due_date as string }
}
function mapMessage(row: Record<string, unknown>): CaseMessage {
  return { id: row.id as string, author: (row.author_label as string) ?? '', date: row.date as string, text: row.text as string, direction: row.direction as CaseMessageDirection }
}

function mapCase(row: Record<string, unknown>): Case {
  return {
    id: row.id as string,
    reference: row.reference as string,
    title: row.title as string,
    clientId: row.client_id as string,
    status: row.status as CaseStatus,
    practiceArea: (row.practice_area as string) ?? '',
    assignedTo: (row.assigned_to as string) ?? null,
    openedAt: row.opened_at as string,
    nextHearing: (row.next_hearing as string) ?? undefined,
    documents: ((row.case_documents as Record<string, unknown>[]) ?? []).map(mapDocument),
    hearings: ((row.case_hearings as Record<string, unknown>[]) ?? []).map(mapHearing),
    notes: ((row.case_notes as Record<string, unknown>[]) ?? []).map(mapNote),
    tasks: ((row.case_tasks as Record<string, unknown>[]) ?? []).map(mapTask),
    messages: ((row.case_messages as Record<string, unknown>[]) ?? []).map(mapMessage),
  }
}

function mapAppointment(row: Record<string, unknown>): AppointmentRequest {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    caseId: row.case_id as string,
    requestedDate: row.requested_date as string,
    proposedDate: (row.proposed_date as string) ?? undefined,
    note: (row.note as string) ?? '',
    status: row.status as AppointmentRequestStatus,
    createdAt: row.created_at as string,
  }
}

function mapNotification(row: Record<string, unknown>): AppNotification {
  return {
    id: row.id as string,
    audience: row.audience as 'cabinet' | 'client',
    text: row.text as string,
    date: row.created_at as string,
    read: row.read as boolean,
    href: (row.href as string) ?? '',
  }
}

function mapInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    number: row.number as string,
    clientId: row.client_id as string,
    caseId: (row.case_id as string) ?? undefined,
    amount: Number(row.amount),
    vatRate: Number(row.vat_rate ?? 19),
    stampDuty: Number(row.stamp_duty ?? 1),
    issuedAt: row.issued_at as string,
    dueAt: (row.due_at as string) ?? undefined,
    status: row.status as InvoiceStatus,
  }
}

function mapPayment(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    caseId: (row.case_id as string) ?? undefined,
    amount: Number(row.amount),
    date: row.date as string,
    method: (row.method as string) ?? '',
    status: row.status as PaymentStatus,
  }
}

function mapContract(row: Record<string, unknown>): Contract {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    title: row.title as string,
    status: row.status as ContractStatus,
    signedAt: (row.signed_at as string) ?? undefined,
    expiresAt: (row.expires_at as string) ?? undefined,
  }
}

function mapAuditLogEntry(row: Record<string, unknown>): AuditLogEntry {
  const actor = row.profiles as { first_name?: string; last_name?: string } | null
  return {
    id: row.id as string,
    date: row.created_at as string,
    actorId: (row.actor_id as string) ?? null,
    actorName: actor ? `${actor.first_name ?? ''} ${actor.last_name ?? ''}`.trim() : 'Utilisateur supprimé',
    actorRole: (row.actor_role as MemberRole) ?? null,
    action: row.action as string,
    entity: row.entity as string,
    detailBefore: (row.detail_before as string) ?? null,
    detailAfter: (row.detail_after as string) ?? null,
  }
}

function mapCorrespondence(row: Record<string, unknown>): Correspondence {
  return {
    id: row.id as string,
    caseId: (row.case_id as string) ?? null,
    direction: row.direction as CaseMessageDirection,
    subject: row.subject as string,
    recipient: row.recipient as string,
    sentAt: row.sent_at as string,
  }
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<Member[]>([])
  const [memberPermissionOverrides, setMemberPermissionOverrides] = useState<Record<string, PermissionSet>>({})
  const [clients, setClients] = useState<Client[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [correspondence, setCorrespondence] = useState<Correspondence[]>([])
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([])
  const cabinetIdRef = useRef<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      cabinetIdRef.current = null
      setMembers([])
      setClients([])
      setCases([])
      setAppointmentRequests([])
      setNotifications([])
      setMemberPermissionOverrides({})
      setInvoices([])
      setPayments([])
      setContracts([])
      setCorrespondence([])
      setAuditLog([])
      setLoading(false)
      return
    }

    const [profilesRes, clientsRes, casesRes, overridesRes, apptRes, notifRes, invoicesRes, paymentsRes, contractsRes, correspondenceRes, auditLogRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('clients').select('*'),
      supabase.from('cases').select('*, case_documents(*), case_hearings(*), case_notes(*), case_tasks(*), case_messages(*)'),
      supabase.from('permission_overrides').select('*'),
      supabase.from('appointment_requests').select('*'),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').order('issued_at', { ascending: false }),
      supabase.from('payments').select('*').order('date', { ascending: false }),
      supabase.from('contracts').select('*'),
      supabase.from('correspondence').select('*').order('sent_at', { ascending: false }),
      supabase.from('audit_log').select('*, profiles(first_name, last_name)').order('created_at', { ascending: false }).limit(200),
    ])

    const myProfile = profilesRes.data?.find((p) => p.id === user.id)
    cabinetIdRef.current = (myProfile?.cabinet_id as string) ?? null

    setMembers((profilesRes.data ?? []).map(mapMember))
    setClients((clientsRes.data ?? []).map(mapClient))
    setCases((casesRes.data ?? []).map(mapCase))
    const overrides: Record<string, PermissionSet> = {}
    for (const row of overridesRes.data ?? []) overrides[row.profile_id as string] = row.permissions as PermissionSet
    setMemberPermissionOverrides(overrides)
    setAppointmentRequests((apptRes.data ?? []).map(mapAppointment))
    setNotifications((notifRes.data ?? []).map(mapNotification))
    setInvoices((invoicesRes.data ?? []).map(mapInvoice))
    setPayments((paymentsRes.data ?? []).map(mapPayment))
    setContracts((contractsRes.data ?? []).map(mapContract))
    setCorrespondence((correspondenceRes.data ?? []).map(mapCorrespondence))
    setAuditLog((auditLogRes.data ?? []).map(mapAuditLogEntry))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const supabase = createClient()
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load()
    })
    return () => sub.subscription.unsubscribe()
  }, [load])

  const pushNotification = useCallback(async (n: { audience: 'cabinet' | 'client'; text: string; href: string }) => {
    if (!cabinetIdRef.current) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notifications')
      .insert({ cabinet_id: cabinetIdRef.current, audience: n.audience, text: n.text, href: n.href })
      .select()
      .single()
    if (!error && data) setNotifications((prev) => [mapNotification(data), ...prev])
  }, [])

  const addMember = async (input: NewMemberInput): Promise<InviteMemberOutcome> => {
    const result = await inviteMember(input)
    if ('error' in result) return result
    await load()
    return result
  }

  const toggleMemberStatus = async (id: string) => {
    const member = members.find((m) => m.id === id)
    if (!member) return
    const newStatus: MemberStatus = member.status === 'active' ? 'inactive' : 'active'
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', id)
    if (!error) setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)))
  }

  const setMemberPermissionOverride = async (id: string, perms: PermissionSet | null) => {
    const supabase = createClient()
    if (perms === null) {
      await supabase.from('permission_overrides').delete().eq('profile_id', id)
      setMemberPermissionOverrides((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } else {
      await supabase.from('permission_overrides').upsert({ profile_id: id, permissions: perms })
      setMemberPermissionOverrides((prev) => ({ ...prev, [id]: perms }))
    }
  }

  const addClient = async (input: NewClientInput): Promise<string | null> => {
    if (!cabinetIdRef.current) return null
    const supabase = createClient()
    const { data, error } = await supabase
      .from('clients')
      .insert({ cabinet_id: cabinetIdRef.current, name: input.name, type: input.type, email: input.email || null, phone: input.phone, address: input.address, city: input.city })
      .select()
      .single()
    if (error || !data) return null
    const client = mapClient(data)
    setClients((prev) => [...prev, client])
    return client.id
  }

  const addCase = async (input: NewCaseInput): Promise<string | null> => {
    if (!cabinetIdRef.current) return null
    const supabase = createClient()
    const year = new Date().getFullYear()
    const reference = `${year}-${Math.floor(100 + Math.random() * 900)}`
    const { data, error } = await supabase
      .from('cases')
      .insert({
        cabinet_id: cabinetIdRef.current,
        reference,
        title: input.title,
        client_id: input.clientId,
        status: 'opened',
        practice_area: input.practiceArea,
        assigned_to: input.assignedTo || null,
      })
      .select()
      .single()
    if (error || !data) return null
    const newCase = mapCase(data)
    setCases((prev) => [newCase, ...prev])
    return newCase.id
  }

  const updateCaseStatus = async (caseId: string, status: CaseStatus): Promise<boolean> => {
    const supabase = createClient()
    const { error } = await supabase.from('cases').update({ status }).eq('id', caseId)
    if (error) return false
    setCases((prev) => prev.map((c) => (c.id === caseId ? { ...c, status } : c)))
    return true
  }

  const toggleCaseTask = async (caseId: string, taskId: string) => {
    const c = cases.find((x) => x.id === caseId)
    const task = c?.tasks.find((t) => t.id === taskId)
    if (!task) return
    const supabase = createClient()
    const { error } = await supabase.from('case_tasks').update({ done: !task.done }).eq('id', taskId)
    if (!error) {
      setCases((prev) =>
        prev.map((cs) => (cs.id === caseId ? { ...cs, tasks: cs.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) } : cs))
      )
    }
  }

  const addCaseTask = async (caseId: string, label: string, dueDate?: string): Promise<boolean> => {
    const trimmed = label.trim()
    if (!trimmed) return false
    const supabase = createClient()
    const { data, error } = await supabase
      .from('case_tasks')
      .insert({ case_id: caseId, label: trimmed, due_date: dueDate || null })
      .select()
      .single()
    if (error || !data) return false
    const task = mapTask(data)
    setCases((prev) => prev.map((c) => (c.id === caseId ? { ...c, tasks: [...c.tasks, task] } : c)))
    return true
  }

  const deleteCaseTask = async (caseId: string, taskId: string): Promise<boolean> => {
    const supabase = createClient()
    const { error } = await supabase.from('case_tasks').delete().eq('id', taskId)
    if (error) return false
    setCases((prev) => prev.map((c) => (c.id === caseId ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) } : c)))
    return true
  }

  const addCaseDocument = async (caseId: string, file: File): Promise<boolean> => {
    const supabase = createClient()
    const path = `${caseId}/${crypto.randomUUID()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('case-documents').upload(path, file)
    if (uploadError) return false
    const ext = file.name.split('.').pop() ?? ''
    const sizeLabel = file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} Mo` : `${Math.max(1, Math.round(file.size / 1024))} Ko`
    const { data, error } = await supabase
      .from('case_documents')
      .insert({ case_id: caseId, name: file.name, type: ext.toUpperCase(), size_label: sizeLabel, storage_path: path })
      .select()
      .single()
    if (error || !data) {
      await supabase.storage.from('case-documents').remove([path])
      return false
    }
    setCases((prev) => prev.map((c) => (c.id === caseId ? { ...c, documents: [...c.documents, mapDocument(data)] } : c)))
    return true
  }

  const getDocumentUrl = async (storagePath: string): Promise<string | null> => {
    const supabase = createClient()
    const { data, error } = await supabase.storage.from('case-documents').createSignedUrl(storagePath, 60)
    if (error || !data) return null
    return data.signedUrl
  }

  const addCaseNote = async (caseId: string, author: string, text: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('case_notes')
      .insert({ case_id: caseId, author_id: user?.id ?? null, author_label: author, text })
      .select()
      .single()
    if (error || !data) return
    setCases((prev) => prev.map((c) => (c.id === caseId ? { ...c, notes: [mapNote(data), ...c.notes] } : c)))
  }

  const addCaseMessage = async (caseId: string, author: string, text: string, direction: CaseMessageDirection) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('case_messages')
      .insert({ case_id: caseId, author_label: author, text, direction })
      .select()
      .single()
    if (error || !data) return
    setCases((prev) => prev.map((c) => (c.id === caseId ? { ...c, messages: [...c.messages, mapMessage(data)] } : c)))
    if (direction === 'in') {
      await pushNotification({ audience: 'cabinet', text: `Nouveau message de ${author}`, href: `/cases/${caseId}` })
    } else {
      await pushNotification({ audience: 'client', text: 'Nouveau message de votre avocat', href: `/espace-client/dossiers/${caseId}` })
    }
  }

  const addCaseHearing = async (caseId: string, input: NewCaseHearingInput): Promise<boolean> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('case_hearings')
      .insert({ case_id: caseId, date: input.date, court: input.court, note: input.note })
      .select()
      .single()
    if (error || !data) return false
    const hearing = mapHearing(data)

    const c = cases.find((x) => x.id === caseId)
    const futureHearingDates = [...(c?.hearings ?? []), hearing]
      .map((h) => h.date)
      .filter((d) => new Date(d).getTime() >= Date.now())
      .sort()
    const nextHearing = futureHearingDates[0]

    if (nextHearing && nextHearing !== c?.nextHearing) {
      await supabase.from('cases').update({ next_hearing: nextHearing }).eq('id', caseId)
    }

    setCases((prev) =>
      prev.map((cs) => (cs.id === caseId ? { ...cs, hearings: [...cs.hearings, hearing], nextHearing: nextHearing ?? cs.nextHearing } : cs))
    )
    return true
  }

  const addAppointmentRequest = async (input: NewAppointmentRequestInput) => {
    if (!cabinetIdRef.current) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('appointment_requests')
      .insert({ cabinet_id: cabinetIdRef.current, client_id: input.clientId, case_id: input.caseId, requested_date: input.requestedDate, note: input.note, status: 'pending' })
      .select()
      .single()
    if (error || !data) return
    setAppointmentRequests((prev) => [mapAppointment(data), ...prev])
    const clientName = clients.find((c) => c.id === input.clientId)?.name ?? 'Un client'
    await pushNotification({ audience: 'cabinet', text: `Nouvelle demande de rendez-vous de ${clientName}`, href: '/messages' })
  }

  const updateAppointmentRequest = async (id: string, patch: Partial<AppointmentRequest>) => {
    const supabase = createClient()
    const dbPatch: Record<string, unknown> = {}
    if (patch.status !== undefined) dbPatch.status = patch.status
    if (patch.proposedDate !== undefined) dbPatch.proposed_date = patch.proposedDate
    const { error } = await supabase.from('appointment_requests').update(dbPatch).eq('id', id)
    if (error) return
    setAppointmentRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    if (patch.status === 'accepted') {
      await pushNotification({ audience: 'client', text: 'Votre rendez-vous a été accepté par le cabinet', href: '/espace-client/rendez-vous' })
    } else if (patch.status === 'rescheduled') {
      await pushNotification({ audience: 'client', text: 'Le cabinet a proposé un nouvel horaire pour votre rendez-vous', href: '/espace-client/rendez-vous' })
    } else if (patch.status === 'declined') {
      await pushNotification({ audience: 'client', text: 'Votre demande de rendez-vous a été refusée', href: '/espace-client/rendez-vous' })
    }
  }

  const addInvoice = async (input: NewInvoiceInput): Promise<string | null> => {
    if (!cabinetIdRef.current) return null
    const supabase = createClient()
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        cabinet_id: cabinetIdRef.current,
        number: input.number,
        client_id: input.clientId,
        case_id: input.caseId || null,
        amount: input.amount,
        vat_rate: input.vatRate,
        stamp_duty: input.stampDuty,
        due_at: input.dueAt || null,
        status: 'pending',
      })
      .select()
      .single()
    if (error || !data) return null
    const invoice = mapInvoice(data)
    setInvoices((prev) => [invoice, ...prev])
    return invoice.id
  }

  const updateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    const supabase = createClient()
    const { error } = await supabase.from('invoices').update({ status }).eq('id', id)
    if (!error) setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
  }

  const addPayment = async (input: NewPaymentInput): Promise<string | null> => {
    if (!cabinetIdRef.current) return null
    const supabase = createClient()
    const { data, error } = await supabase
      .from('payments')
      .insert({
        cabinet_id: cabinetIdRef.current,
        client_id: input.clientId,
        case_id: input.caseId || null,
        amount: input.amount,
        method: input.method,
        status: input.status,
      })
      .select()
      .single()
    if (error || !data) return null
    const payment = mapPayment(data)
    setPayments((prev) => [payment, ...prev])
    return payment.id
  }

  const addContract = async (input: NewContractInput): Promise<string | null> => {
    if (!cabinetIdRef.current) return null
    const supabase = createClient()
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        cabinet_id: cabinetIdRef.current,
        client_id: input.clientId,
        title: input.title,
        status: 'draft',
        signed_at: input.signedAt || null,
        expires_at: input.expiresAt || null,
      })
      .select()
      .single()
    if (error || !data) return null
    const contract = mapContract(data)
    setContracts((prev) => [contract, ...prev])
    return contract.id
  }

  const updateContractStatus = async (id: string, status: ContractStatus) => {
    const supabase = createClient()
    const { error } = await supabase.from('contracts').update({ status }).eq('id', id)
    if (!error) setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
  }

  const addCorrespondence = async (input: NewCorrespondenceInput): Promise<string | null> => {
    if (!cabinetIdRef.current) return null
    const supabase = createClient()
    const { data, error } = await supabase
      .from('correspondence')
      .insert({
        cabinet_id: cabinetIdRef.current,
        case_id: input.caseId || null,
        direction: input.direction,
        subject: input.subject,
        recipient: input.recipient,
      })
      .select()
      .single()
    if (error || !data) return null
    const entry = mapCorrespondence(data)
    setCorrespondence((prev) => [entry, ...prev])
    return entry.id
  }

  const markNotificationRead = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
    if (!error) setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllNotificationsRead = async (audience: 'cabinet' | 'client') => {
    if (!cabinetIdRef.current) return
    const supabase = createClient()
    const ids = notifications.filter((n) => n.audience === audience && !n.read).map((n) => n.id)
    if (ids.length === 0) return
    const { error } = await supabase.from('notifications').update({ read: true }).in('id', ids)
    if (!error) setNotifications((prev) => prev.map((n) => (n.audience === audience ? { ...n, read: true } : n)))
  }

  const value: AppDataContextValue = {
    loading,
    members,
    addMember,
    toggleMemberStatus,
    memberPermissionOverrides,
    setMemberPermissionOverride,
    clients,
    addClient,
    cases,
    addCase,
    updateCaseStatus,
    toggleCaseTask,
    addCaseTask,
    deleteCaseTask,
    addCaseDocument,
    getDocumentUrl,
    addCaseNote,
    addCaseMessage,
    addCaseHearing,
    appointmentRequests,
    addAppointmentRequest,
    updateAppointmentRequest,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    invoices,
    addInvoice,
    updateInvoiceStatus,
    payments,
    addPayment,
    contracts,
    addContract,
    updateContractStatus,
    correspondence,
    addCorrespondence,
    auditLog,
    refresh: load,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider')
  return ctx
}
