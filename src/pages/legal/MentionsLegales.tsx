import { Link } from 'react-router-dom'
import LegalLayout, { LegalSection, Placeholder } from './LegalLayout'

// Mentions légales — obligatoires pour tout site édité depuis la France
// (art. 6 LCEN). Le seul champ qui reste à compléter avant publication
// est l'adresse du siège (obligatoire).

export default function MentionsLegales() {
  return (
    <LegalLayout title="Mentions légales" lastUpdated="12 mai 2026">
      <p>
        Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004
        pour la Confiance dans l'économie numérique, dite L.C.E.N., nous portons à la connaissance
        des utilisateurs et visiteurs du site Velmio CRM les informations suivantes.
      </p>

      <LegalSection title="Éditeur du site">
        <ul className="list-disc list-inside space-y-1">
          <li>Raison sociale : <strong>Sky Social Agency</strong></li>
          <li>Forme juridique : Entreprise individuelle (micro-entreprise)</li>
          <li>Activité exercée à titre individuel par : <strong>Meryne Ndjeyi</strong></li>
          <li>SIRET : 901 055 905 00011</li>
          <li>TVA non applicable, art. 293 B du CGI (franchise en base de TVA)</li>
          <li>Adresse du siège social : <Placeholder>[À COMPLÉTER — rue, code postal, ville]</Placeholder></li>
          <li>Email : <a href="mailto:skysocialfr@gmail.com" className="text-indigo-600 hover:underline">skysocialfr@gmail.com</a></li>
          <li>Téléphone : +33 6 69 70 80 46</li>
          <li>Directeur de la publication : Meryne Ndjeyi</li>
        </ul>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>Le site est hébergé par les prestataires suivants :</p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Frontend (interface utilisateur)</strong> — GitHub Pages, fourni par GitHub, Inc.,
            88 Colin P Kelly Jr Street, San Francisco, CA 94107, États-Unis. Site web : github.com.
          </li>
          <li>
            <strong>Base de données et services backend</strong> — Supabase, Inc.,
            970 Toa Payoh North, #07-04, Singapour 318992. Site web : supabase.com.
            Les données sont stockées dans la région Europe (Irlande).
          </li>
          <li>
            <strong>Paiements</strong> — Stripe Payments Europe Ltd., The One Building,
            1 Lower Grand Canal Street, Dublin 2, Irlande. Site web : stripe.com.
          </li>
          <li>
            <strong>Envoi d'emails transactionnels</strong> — Resend, Inc.,
            2261 Market Street #5039, San Francisco, CA 94114, États-Unis. Site web : resend.com.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L'ensemble du contenu présent sur le site Velmio CRM (textes, graphismes, logos,
          icônes, images, code source) est la propriété exclusive de Sky Social Agency
          ou de ses partenaires, et est protégé par le droit d'auteur. Toute reproduction,
          représentation, modification ou exploitation totale ou partielle, sans autorisation
          écrite préalable, est interdite.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Le traitement des données personnelles fait l'objet d'une politique de confidentialité
          dédiée, accessible <Link to="/legal/confidentialite" className="text-indigo-600 hover:underline">ici</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Pour toute question relative à ces mentions légales, vous pouvez nous écrire à
          <a href="mailto:skysocialfr@gmail.com" className="text-indigo-600 hover:underline"> skysocialfr@gmail.com</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
