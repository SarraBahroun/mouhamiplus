'use client'

import { LegalPageShell, LegalSection } from '@/components/marketing/LegalPageShell'
import { useLang } from '@/providers/LangProvider'

export default function ConditionsPage() {
  const { tr } = useLang()

  return (
    <LegalPageShell title={tr.terms_page_title} updated={tr.terms_updated}>
      <LegalSection title={tr.terms_s1_title}>
        <p>{tr.terms_s1_p1}</p>
      </LegalSection>

      <LegalSection title={tr.terms_s2_title}>
        <p>{tr.terms_s2_p1}</p>
        <p>{tr.terms_s2_p2}</p>
      </LegalSection>

      <LegalSection title={tr.terms_s3_title}>
        <p>{tr.terms_s3_p1}</p>
      </LegalSection>

      <LegalSection title={tr.terms_s4_title}>
        <p>{tr.terms_s4_p1}</p>
      </LegalSection>

      <LegalSection title={tr.terms_s5_title}>
        <p>{tr.terms_s5_p1}</p>
      </LegalSection>

      <LegalSection title={tr.terms_s6_title}>
        <p>
          {tr.terms_s6_p1_pre}{' '}
          <a href="/confidentialite" style={{ color: 'var(--color-navy)', fontWeight: 500 }}>
            {tr.terms_s6_p1_link}
          </a>
          . {tr.terms_s6_p1_post}
        </p>
      </LegalSection>

      <LegalSection title={tr.terms_s7_title}>
        <p>{tr.terms_s7_p1}</p>
      </LegalSection>

      <LegalSection title={tr.terms_s8_title}>
        <p>{tr.terms_s8_p1}</p>
      </LegalSection>

      <LegalSection title={tr.terms_s9_title}>
        <p>{tr.terms_s9_p1}</p>
      </LegalSection>

      <LegalSection title={tr.terms_s10_title}>
        <p>
          {tr.terms_s10_p1_pre}{' '}
          <a href="mailto:mouhamiplus@gmail.com" style={{ color: 'var(--color-navy)', fontWeight: 500 }}>
            mouhamiplus@gmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  )
}
