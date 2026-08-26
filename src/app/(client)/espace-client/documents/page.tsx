'use client'

import { useAppData } from '@/providers/AppDataProvider'
import { useClientSession } from '@/providers/ClientSessionProvider'
import { useToast } from '@/providers/ToastProvider'
import { useLang } from '@/providers/LangProvider'

const TYPE_ICON: Record<string, string> = { PDF: '📕', DOCX: '📘', XLSX: '📗' }

export default function ClientDocumentsPage() {
  const { tr } = useLang()
  const { clientProfile } = useClientSession()
  const { cases: allCases, getDocumentUrl } = useAppData()
  const { showToast } = useToast()
  const cases = allCases.filter((c) => c.clientId === clientProfile?.id)
  const documents = cases.flatMap((c) => c.documents.map((d) => ({ ...d, caseTitle: c.title, caseId: c.id })))

  const openDocument = async (storagePath: string | null) => {
    if (!storagePath) return
    const url = await getDocumentUrl(storagePath)
    if (url) window.open(url, '_blank')
    else showToast(tr.client_documents_open_error)
  }

  const countLabel = (documents.length === 1 ? tr.client_documents_count_one : tr.client_documents_count_other).replace(
    '{count}',
    String(documents.length)
  )

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>{tr.client_documents_title}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>{countLabel}</p>
        </div>

        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
          {documents.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>{tr.client_documents_empty}</div>
          )}
          {documents.map((d, i) => (
            <div
              key={`${d.caseId}-${d.id}`}
              onClick={() => openDocument(d.storagePath)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderBottom: i < documents.length - 1 ? '1px solid var(--color-border)' : 'none',
                cursor: d.storagePath ? 'pointer' : 'default',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(22, 35, 63, 0.02)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <span style={{ fontSize: 20 }}>{TYPE_ICON[d.type] ?? '📄'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: 'var(--color-foreground)' }}>{d.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{d.caseTitle}</div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{d.size}</span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', minWidth: 76, textAlign: 'end' }}>{d.addedAt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
