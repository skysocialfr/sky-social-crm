import { Link } from 'react-router-dom'
import LegalLayout, { LegalSection } from './LegalLayout'

// Conditions générales d'utilisation — base à adapter par un juriste
// avant utilisation commerciale réelle. Les zones jaunes signalent
// les choix éditeurs/business qui doivent être validés.

export default function CGU() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" lastUpdated="12 mai 2026">
      <p>
        Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et
        l'utilisation du service Velmio CRM (ci-après le « Service ») édité par
        <strong> Sky Social Agency</strong>, entreprise individuelle exploitée par
        Meryne Ndjeyi, immatriculée sous le SIRET 901 055 905 00011 (ci-après l' « Éditeur »).
      </p>

      <LegalSection title="1. Objet">
        <p>
          Le Service est une application web de gestion de la relation client (CRM) destinée aux
          professionnels souhaitant suivre leurs prospects, planifier leurs relances et organiser
          leur pipeline commercial.
        </p>
      </LegalSection>

      <LegalSection title="2. Acceptation des CGU">
        <p>
          En créant un compte sur Velmio CRM, l'Utilisateur reconnaît avoir pris connaissance des
          présentes CGU et les accepter sans réserve. À défaut d'acceptation, l'Utilisateur doit
          renoncer à utiliser le Service.
        </p>
      </LegalSection>

      <LegalSection title="3. Création de compte et accès">
        <p>
          L'accès au Service nécessite la création d'un compte personnel. L'Utilisateur s'engage à
          fournir des informations exactes, complètes et à jour. Les identifiants de connexion
          sont strictement personnels et confidentiels ; l'Utilisateur est seul responsable des
          actions effectuées depuis son compte.
        </p>
      </LegalSection>

      <LegalSection title="4. Description du Service">
        <p>Le Service propose plusieurs niveaux d'abonnement :</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Gratuit</strong> — jusqu'à 25 prospects, fonctionnalités essentielles</li>
          <li><strong>Pro</strong> — 9 €/mois, jusqu'à 500 prospects, import CSV, statistiques avancées</li>
          <li><strong>Team</strong> — 29 €/mois, prospects illimités, support prioritaire</li>
        </ul>
        <p>
          Les fonctionnalités précises de chaque plan sont décrites sur la page d'inscription et
          dans l'espace Réglages → Abonnement. Elles peuvent évoluer ; l'Utilisateur en sera informé
          le cas échéant.
        </p>
      </LegalSection>

      <LegalSection title="5. Prix et paiement">
        <p>
          Les abonnements payants sont facturés mensuellement et sans engagement. Le paiement est
          opéré via la plateforme Stripe ; aucune donnée bancaire n'est stockée par Velmio CRM.
          En cas d'échec de prélèvement, l'abonnement est suspendu jusqu'à régularisation, et les
          fonctionnalités au-delà du plan Gratuit redeviennent indisponibles.
        </p>
        <p>
          L'Utilisateur peut mettre à jour son moyen de paiement, télécharger ses factures ou
          annuler son abonnement à tout moment depuis l'espace Réglages → Abonnement (portail
          Stripe sécurisé).
        </p>
      </LegalSection>

      <LegalSection title="6. Résiliation">
        <p>
          L'Utilisateur peut résilier son abonnement à tout moment. La résiliation prend effet à la
          fin de la période de facturation en cours ; aucun remboursement prorata temporis n'est
          effectué. L'Éditeur se réserve le droit de suspendre ou résilier un compte en cas de
          manquement aux présentes CGU.
        </p>
      </LegalSection>

      <LegalSection title="7. Responsabilité">
        <p>
          L'Éditeur met en œuvre les moyens raisonnables pour assurer la disponibilité et la
          sécurité du Service, mais ne peut garantir une disponibilité ininterrompue. La
          responsabilité de l'Éditeur ne saurait être engagée en cas d'indisponibilité temporaire,
          de perte de données imputable à un cas de force majeure, ou d'utilisation non conforme
          du Service.
        </p>
      </LegalSection>

      <LegalSection title="8. Propriété intellectuelle">
        <p>
          Les éléments du Service (interface, logos, code, documentation) restent la propriété
          exclusive de l'Éditeur. L'Utilisateur conserve la pleine propriété des données qu'il
          saisit dans le Service (prospects, notes, fichiers).
        </p>
      </LegalSection>

      <LegalSection title="9. Données personnelles">
        <p>
          Le traitement des données personnelles est détaillé dans la
          <Link to="/legal/confidentialite" className="text-indigo-600 hover:underline"> Politique de confidentialité</Link>.
        </p>
      </LegalSection>

      <LegalSection title="10. Modification des CGU">
        <p>
          L'Éditeur se réserve le droit de modifier les présentes CGU. Les Utilisateurs seront
          informés des modifications substantielles par email au moins quinze (15) jours avant leur
          entrée en vigueur.
        </p>
      </LegalSection>

      <LegalSection title="11. Droit applicable et juridiction">
        <p>
          Les présentes CGU sont régies par le droit français. Tout litige relatif à leur
          interprétation ou à leur exécution relève des tribunaux compétents du ressort du siège
          de l'Éditeur, sous réserve des dispositions impératives applicables aux consommateurs.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
