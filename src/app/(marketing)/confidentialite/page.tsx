'use client'

import { LegalPageShell, LegalSection } from '@/components/marketing/LegalPageShell'
import { useLang } from '@/providers/LangProvider'

export default function ConfidentialitePage() {
  const { tr } = useLang()

  return (
    <LegalPageShell title={tr.privacy_page_title} updated={tr.privacy_updated}>
      <LegalSection title={tr.privacy_s1_title}>
        <p>{tr.privacy_s1_p1}</p>
      </LegalSection>

      <LegalSection title={tr.privacy_s2_title}>
        <p>{tr.privacy_s2_intro}</p>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>{tr.privacy_s2_li1}</li>
          <li>{tr.privacy_s2_li2}</li>
          <li>{tr.privacy_s2_li3}</li>
          <li>{tr.privacy_s2_li4}</li>
        </ul>
      </LegalSection>

      <LegalSection title={tr.privacy_s3_title}>
        <p>{tr.privacy_s3_p1}</p>
      </LegalSection>

      <LegalSection title={tr.privacy_s4_title}>
        <p>{tr.privacy_s4_p1}</p>
      </LegalSection>

      <LegalSection title={tr.privacy_s5_title}>
        <p>{tr.privacy_s5_p1}</p>
      </LegalSection>

      <LegalSection title={tr.privacy_s6_title}>
        <p>{tr.privacy_s6_p1}</p>
      </LegalSection>

      <LegalSection title={tr.privacy_s7_title}>
        <p>
          {tr.privacy_s7_p1_pre}{' '}
          <a href="mailto:mouhamiplus@gmail.com" style={{ color: 'var(--color-navy)', fontWeight: 500 }}>
            mouhamiplus@gmail.com
          </a>
          . {tr.privacy_s7_p1_post}
        </p>
      </LegalSection>

      <LegalSection title={tr.privacy_s8_title}>
        <p>{tr.privacy_s8_p1}</p>
      </LegalSection>

      <LegalSection title={tr.privacy_s9_title}>
        <p>
          {tr.privacy_s9_p1_pre}{' '}
          <a href="mailto:mouhamiplus@gmail.com" style={{ color: 'var(--color-navy)', fontWeight: 500 }}>
            mouhamiplus@gmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  )
}
