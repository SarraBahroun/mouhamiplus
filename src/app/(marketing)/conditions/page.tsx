import { LegalPageShell, LegalSection } from '@/components/marketing/LegalPageShell'

export default function ConditionsPage() {
  return (
    <LegalPageShell title="Conditions générales d'utilisation" updated="17 août 2026">
      <LegalSection title="1. Objet">
        <p>
          Les présentes conditions générales d&apos;utilisation (« CGU ») régissent l&apos;accès et l&apos;utilisation de la
          plateforme Mouhami+, un service de gestion de cabinet d&apos;avocats (dossiers, clients, facturation,
          correspondance, agenda et espace client) édité et opéré depuis la Tunisie. Toute création de compte
          implique l&apos;acceptation pleine et entière des présentes CGU.
        </p>
      </LegalSection>

      <LegalSection title="2. Accès au service et création de compte">
        <p>
          L&apos;accès à Mouhami+ est réservé aux avocats inscrits à un barreau, aux cabinets d&apos;avocats et à leurs
          collaborateurs autorisés, ainsi qu&apos;aux clients invités par un cabinet via l&apos;espace client dédié.
        </p>
        <p>
          Chaque utilisateur est responsable de la confidentialité de ses identifiants et de toute activité effectuée
          depuis son compte. Le cabinet titulaire de l&apos;abonnement est responsable de la gestion des accès de ses
          collaborateurs (création, permissions, révocation).
        </p>
      </LegalSection>

      <LegalSection title="3. Abonnement et facturation">
        <p>
          L&apos;accès aux fonctionnalités du cabinet est soumis à un abonnement payant dont les formules et tarifs sont
          présentés sur la page d&apos;accueil. Le paiement s&apos;effectue selon les moyens proposés au moment de
          l&apos;inscription. Un compte dont l&apos;abonnement n&apos;est pas actif voit l&apos;accès aux fonctionnalités du
          cabinet suspendu jusqu&apos;à régularisation.
        </p>
      </LegalSection>

      <LegalSection title="4. Obligations de l'utilisateur">
        <p>
          L&apos;utilisateur s&apos;engage à n&apos;utiliser Mouhami+ que dans le cadre de son activité professionnelle
          licite, à ne pas tenter de contourner les mesures de sécurité de la plateforme, et à respecter le secret
          professionnel et la réglementation applicable à l&apos;exercice de la profession d&apos;avocat, notamment
          s&apos;agissant des pièces et échanges déposés sur la plateforme.
        </p>
      </LegalSection>

      <LegalSection title="5. Propriété intellectuelle">
        <p>
          La plateforme Mouhami+, sa marque, son interface et son code restent la propriété exclusive de leur éditeur.
          Les données et documents déposés par les cabinets et leurs clients (dossiers, pièces, correspondance) restent
          la propriété de leurs auteurs respectifs ; Mouhami+ n&apos;en revendique aucun droit au-delà de ce qui est
          nécessaire à la fourniture du service.
        </p>
      </LegalSection>

      <LegalSection title="6. Données et confidentialité">
        <p>
          Le traitement des données à caractère personnel est décrit dans la{' '}
          <a href="/confidentialite" style={{ color: 'var(--color-navy)', fontWeight: 500 }}>
            politique de confidentialité
          </a>
          . Les documents et échanges couverts par le secret professionnel de l&apos;avocat ne sont accessibles qu&apos;aux
          personnes autorisées par le cabinet.
        </p>
      </LegalSection>

      <LegalSection title="7. Responsabilité">
        <p>
          Mouhami+ met en œuvre les moyens raisonnables pour assurer la disponibilité et la sécurité du service, sans
          garantie d&apos;absence totale d&apos;interruption. Chaque cabinet demeure seul responsable du contenu qu&apos;il
          dépose sur la plateforme et des conseils ou actes juridiques qu&apos;il fournit à ses clients.
        </p>
      </LegalSection>

      <LegalSection title="8. Résiliation">
        <p>
          Le cabinet peut résilier son abonnement à tout moment depuis les paramètres de son compte. En cas de
          manquement grave aux présentes CGU, Mouhami+ se réserve le droit de suspendre ou clôturer un compte, après
          notification, sauf urgence justifiant une suspension immédiate.
        </p>
      </LegalSection>

      <LegalSection title="9. Droit applicable et juridiction compétente">
        <p>
          Les présentes CGU sont soumises au droit tunisien. Tout litige relatif à leur interprétation ou leur
          exécution relève de la compétence exclusive des juridictions tunisiennes, sauf disposition impérative
          contraire.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Pour toute question relative aux présentes conditions, vous pouvez nous écrire à{' '}
          <a href="mailto:contact@mouhami.plus" style={{ color: 'var(--color-navy)', fontWeight: 500 }}>
            contact@mouhami.plus
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  )
}
