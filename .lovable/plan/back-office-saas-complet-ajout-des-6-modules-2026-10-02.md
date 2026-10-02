# Back-office SaaS complet — ajout des 6 modules

## 1. Gestion des utilisateurs
- Liste avec email, rôle, date d'inscription, dernière connexion, nombre de plans, statut (actif/suspendu).
- Actions : suspendre / réactiver, supprimer le compte (avec confirmation), passer admin / retirer admin, envoyer un lien de réinitialisation du mot de passe.
- Garde-fou : un admin ne peut ni se suspendre, ni se supprimer, ni retirer son propre rôle.

## 2. Recherche, filtres, pagination, export
- Onglets Utilisateurs, Business plans, Logs : recherche, filtres (rôle, statut, secteur, niveau), pagination 25 par page, export CSV.

## 3. Journal des actions administrateurs
- Nouveau journal global : qui, quoi, sur qui, quand (suppression, suspension, rôle, réinitialisation, annonces, réglages).
- Nouvel onglet « Journal admin » avec filtres et export CSV ; lecture seule, non modifiable.

## 4. Double authentification (admin)
- Activation par application d'authentification (Google Authenticator, Authy) dans l'onglet Sécurité : QR code, code à 6 chiffres.
- À la connexion `/admin/login`, si activée, code demandé avant l'accès ; accès au back-office refusé sans ce second niveau.

## 5. Indicateurs de revenus
- Onglet « Revenus » : revenu mensuel estimé (selon les plans), répartition Free/Pro/Business, conversions, départs.
- Bandeau indiquant que les chiffres seront réels après activation des paiements (actuellement 0 car période gratuite).

## 6. Extras
- **Annonces** : l'admin crée une annonce (titre, message, type info/alerte, dates) affichée en bandeau dans l'application ; fermable par l'utilisateur.
- **Support** : bouton « Aide » dans l'application → formulaire ; onglet « Support » côté admin (statut ouvert/en cours/résolu, réponse interne).
- **Réglages généraux** : mode maintenance (message affiché aux non-admins), date de fin de gratuité, email de contact.

## Détails techniques
- Actions sensibles (email, suspension, suppression, rôle, reset) via une fonction serveur `admin-users` vérifiant le rôle admin depuis le jeton, utilisant le service role ; chaque action écrit dans `admin_audit_log`.
- Nouvelles tables (GRANT + RLS) : `admin_audit_log` (lecture admin, écriture serveur/trigger), `announcements` (lecture authentifiée des actives, gestion admin), `support_tickets` (utilisateur : ses tickets ; admin : tout), `app_settings` (lecture publique, écriture admin).
- Triggers d'audit sur suppression de plans, changements de `user_roles`, annonces, réglages.
- 2FA via MFA TOTP natif de l'auth ; `AdminRoute` exige le niveau `aal2` quand un facteur est vérifié.
- Suspension = ban côté auth (connexion bloquée).
- Tout en FR/EN, responsive, vérifié par Playwright avec le compte admin.
