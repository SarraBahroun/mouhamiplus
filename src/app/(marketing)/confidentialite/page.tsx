import { LegalPageShell, LegalSection } from '@/components/marketing/LegalPageShell'

export default function ConfidentialitePage() {
  return (
    <LegalPageShell title="Politique de confidentialité" updated="17 août 2026">
      <LegalSection title="1. Responsable du traitement">
        <p>
          Mouhami+ est responsable du traitement des données à caractère personnel collectées via la plateforme, dans
          le respect de la loi organique n° 2004-63 du 27 juillet 2004 relative à la protection des données à
          caractère personnel et des textes applicables en Tunisie.
        </p>
      </LegalSection>

      <LegalSection title="2. Données collectées">
        <p>Selon votre profil, Mouhami+ traite notamment :</p>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>identité et coordonnées (nom, email, téléphone) des avocats, collaborateurs et clients ;</li>
          <li>données d&apos;authentification (mot de passe chiffré, journal de connexion) ;</li>
          <li>données liées aux dossiers juridiques (pièces, correspondance, échéances, facturation) ;</li>
          <li>données de paiement d&apos;abonnement (justificatifs de virement, sans conservation de coordonnées bancaires complètes).</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Finalités du traitement">
        <p>
          Ces données sont traitées pour fournir le service (gestion de dossiers, facturation, communication
          cabinet-client), sécuriser les comptes, assurer le support, et respecter nos obligations légales et
          contractuelles.
        </p>
      </LegalSection>

      <LegalSection title="4. Destinataires des données">
        <p>
          Les données d&apos;un cabinet sont accessibles à ses collaborateurs selon les permissions définies par le
          cabinet, et aux clients concernés pour les seules données de leur propre dossier via l&apos;espace client.
          Mouhami+ ne vend ni ne loue aucune donnée à des tiers. Des sous-traitants techniques (hébergement,
          messagerie transactionnelle) peuvent traiter des données pour notre compte, dans le cadre strict de la
          fourniture du service.
        </p>
      </LegalSection>

      <LegalSection title="5. Durée de conservation">
        <p>
          Les données sont conservées pendant la durée de l&apos;abonnement, puis archivées ou supprimées conformément
          aux obligations légales de conservation applicables à l&apos;activité d&apos;avocat, sauf demande de suppression
          anticipée compatible avec ces obligations.
        </p>
      </LegalSection>

      <LegalSection title="6. Sécurité">
        <p>
          L&apos;accès aux comptes est protégé par mot de passe et authentification à deux facteurs. Les permissions
          sont appliquées au niveau de la base de données, en plus de l&apos;interface, afin qu&apos;un utilisateur ne
          puisse consulter que les données auxquelles il est autorisé à accéder.
        </p>
      </LegalSection>

      <LegalSection title="7. Vos droits">
        <p>
          Conformément à la réglementation applicable, vous disposez d&apos;un droit d&apos;accès, de rectification,
          d&apos;opposition et de suppression de vos données à caractère personnel. Pour l&apos;exercer, contactez-nous à{' '}
          <a href="mailto:mouhamiplus@gmail.com" style={{ color: 'var(--color-navy)', fontWeight: 500 }}>
            mouhamiplus@gmail.com
          </a>
          . Vous pouvez également saisir l&apos;Instance Nationale de Protection des Données Personnelles (INPDP) en
          cas de litige non résolu directement avec nous.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies">
        <p>
          Mouhami+ utilise uniquement des cookies strictement nécessaires au fonctionnement du service (session
          d&apos;authentification, préférences d&apos;affichage). Aucun cookie publicitaire ou de traçage tiers n&apos;est
          utilisé.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          Pour toute question relative à cette politique ou au traitement de vos données, écrivez-nous à{' '}
          <a href="mailto:mouhamiplus@gmail.com" style={{ color: 'var(--color-navy)', fontWeight: 500 }}>
            mouhamiplus@gmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  )
}
