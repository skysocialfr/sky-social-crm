import LegalLayout, { LegalSection } from './LegalLayout'

// Politique de confidentialité — base conforme RGPD à faire valider
// par un juriste pour un usage commercial. Couvre les éléments
// obligatoires de l'art. 13 RGPD (informations à fournir lors de la
// collecte de données auprès de la personne concernée).

export default function Confidentialite() {
  return (
    <LegalLayout title="Politique de confidentialité" lastUpdated="12 mai 2026">
      <p>
        La présente politique décrit la manière dont Velmio CRM collecte, utilise et protège les
        données personnelles de ses utilisateurs, conformément au Règlement Général sur la
        Protection des Données (RGPD) et à la loi Informatique et Libertés.
      </p>

      <LegalSection title="1. Responsable du traitement">
        <p>
          Le responsable du traitement des données personnelles est <strong>Sky Social Agency</strong>,
          entreprise individuelle exploitée par Meryne Ndjeyi (SIRET 901 055 905 00011), dont les
          coordonnées complètes figurent dans les
          <a href="#/legal/mentions" className="text-indigo-600 hover:underline"> Mentions légales</a>.
        </p>
        <p>Contact RGPD : <a href="mailto:skysocialfr@gmail.com" className="text-indigo-600 hover:underline">skysocialfr@gmail.com</a></p>
      </LegalSection>

      <LegalSection title="2. Données collectées">
        <p>Nous collectons et traitons les catégories de données suivantes :</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Données de compte</strong> : adresse email, mot de passe (haché), nom de société, logo, couleur de marque</li>
          <li><strong>Données de prospection</strong> : prospects, interactions, notes, dates de relance saisis par l'Utilisateur</li>
          <li><strong>Données de facturation</strong> : identifiant Stripe client, statut d'abonnement, dates de paiement. Les coordonnées bancaires ne sont jamais stockées par Velmio CRM et restent gérées par Stripe.</li>
          <li><strong>Données techniques</strong> : journaux d'authentification (Supabase Auth), adresse IP de connexion, agent utilisateur — utilisés à des fins de sécurité.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Finalités du traitement">
        <ul className="list-disc list-inside space-y-1">
          <li>Fournir le service Velmio CRM et gérer le compte de l'Utilisateur</li>
          <li>Facturer les abonnements payants et émettre les reçus correspondants</li>
          <li>Envoyer les emails transactionnels (confirmation d'inscription, réinitialisation de mot de passe, notifications de relance)</li>
          <li>Assurer la sécurité du service et détecter les usages frauduleux</li>
          <li>Répondre aux demandes de support</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Bases légales">
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Exécution du contrat</strong> : pour la fourniture du service et la facturation</li>
          <li><strong>Intérêt légitime</strong> : pour la sécurité et la prévention des fraudes</li>
          <li><strong>Obligation légale</strong> : pour la conservation des factures (10 ans)</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Destinataires des données">
        <p>Les données sont accessibles uniquement à :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>L'Éditeur et ses sous-traitants techniques strictement nécessaires au fonctionnement du service</li>
          <li>Supabase, Inc. (hébergement base de données, région UE)</li>
          <li>Stripe Payments Europe Ltd. (traitement des paiements)</li>
          <li>Resend, Inc. (envoi des emails transactionnels)</li>
          <li>GitHub, Inc. (hébergement du frontend statique)</li>
        </ul>
        <p>
          Aucune donnée n'est revendue, cédée ou communiquée à des tiers à des fins commerciales.
        </p>
      </LegalSection>

      <LegalSection title="6. Transferts hors Union européenne">
        <p>
          Certains sous-traitants (Stripe, Resend, GitHub) sont établis aux États-Unis. Ces
          transferts sont encadrés par les clauses contractuelles types adoptées par la
          Commission européenne, et / ou par le cadre Data Privacy Framework lorsque le
          sous-traitant y est certifié, garantissant un niveau de protection équivalent à celui
          de l'Union européenne.
        </p>
      </LegalSection>

      <LegalSection title="7. Durée de conservation">
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Données de compte et de prospection</strong> : pendant toute la durée de l'utilisation du service, et jusqu'à 30 jours après la suppression du compte</li>
          <li><strong>Données de facturation</strong> : 10 ans à compter de l'émission de la facture (obligation comptable)</li>
          <li><strong>Journaux de connexion</strong> : 12 mois maximum</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Vos droits">
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Droit d'accès</strong> — obtenir une copie de vos données</li>
          <li><strong>Droit de rectification</strong> — corriger des données inexactes</li>
          <li><strong>Droit à l'effacement</strong> (« droit à l'oubli ») — supprimer vos données</li>
          <li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format structuré (CSV, JSON)</li>
          <li><strong>Droit d'opposition</strong> et de limitation du traitement</li>
          <li><strong>Droit de retirer votre consentement</strong> à tout moment</li>
        </ul>
        <p>
          Pour exercer ces droits, écrivez-nous à
          <a href="mailto:skysocialfr@gmail.com" className="text-indigo-600 hover:underline"> skysocialfr@gmail.com</a>.
          Nous répondons dans un délai d'un mois maximum.
        </p>
        <p>
          Vous disposez également du droit d'introduire une réclamation auprès de la
          <a href="https://www.cnil.fr/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline"> CNIL </a>
          si vous estimez que le traitement de vos données n'est pas conforme à la réglementation.
        </p>
      </LegalSection>

      <LegalSection title="9. Cookies et traceurs">
        <p>
          Velmio CRM utilise uniquement des cookies et stockages locaux strictement nécessaires
          au fonctionnement du service :
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Jeton de session d'authentification (Supabase Auth, stocké en localStorage)</li>
          <li>Préférence de thème clair / sombre</li>
          <li>État de consentement à la présente politique (bannière d'information)</li>
        </ul>
        <p>
          Aucun cookie de mesure d'audience, de profilage ou publicitaire n'est déposé. À ce titre,
          le service ne nécessite pas de consentement préalable au sens de la CNIL.
        </p>
      </LegalSection>

      <LegalSection title="10. Sécurité">
        <p>
          Les données sont chiffrées en transit (TLS) et au repos. L'accès aux données de chaque
          utilisateur est cloisonné au niveau de la base via des politiques de sécurité au niveau
          des lignes (Row Level Security). Les mots de passe sont hachés par Supabase Auth.
        </p>
      </LegalSection>

      <LegalSection title="11. Modifications">
        <p>
          La présente politique peut être mise à jour. Les modifications substantielles seront
          notifiées par email et la date de dernière mise à jour figure en haut de page.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
