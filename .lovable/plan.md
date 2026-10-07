# Plan — Atteindre 100 % du développement PlanCraft Pro

## État actuel
- Application : 100 % du périmètre fonctionnel livré et testé (39/39 tests unitaires, ~48 E2E, WCAG 2.1 AA, responsive mobile/tablette, PWA installable).
- Back-office : 12 onglets en place et vérifiés au navigateur.
- Reste 4 points ouverts, dont 2 dépendent de vous (clé Sentry, nouveau mot de passe admin).

## Étape 1 — Fiabiliser le back-office (actions non encore testées)
Tester de bout en bout avec le compte administrateur, sur ordinateur + tablette + mobile :
- Suspendre / réactiver / supprimer un compte de test, changer un rôle, envoyer un lien de réinitialisation de mot de passe.
- Publier une annonce et vérifier qu'elle s'affiche côté utilisateur (bandeau) puis qu'elle se masque.
- Envoyer une demande d'aide via le bouton « Aide » et la retrouver dans l'onglet Support.
- Activer puis désactiver le mode maintenance et vérifier l'écran « Maintenance en cours ».
- Vérifier que chaque action apparaît dans le Journal admin.

## Étape 2 — Double authentification administrateur
- Activer la double authentification (code à 6 chiffres) sur le compte admin depuis l'onglet Sécurité.
- Vérifier la connexion complète : mot de passe puis code, accès au back-office, refus sans code.

## Étape 3 — Date de fin de gratuité pilotée depuis les Réglages
- Faire lire la date de fin de gratuité (`free_access_until`) depuis les Réglages du back-office au lieu de la date fixe du 31/12/2026.
- Le compte à rebours, les rappels (30/7/1 jours) et les limites de plan suivront automatiquement cette date.
- Valeur par défaut conservée : 31/12/2026.

## Étape 4 — Vrais tarifs dans l'onglet Revenus
- Remplacer les prix d'exemple (Pro 19 €, Business 49 €) par vos tarifs réels dès que vous les fournissez.

## Étape 5 — Monitoring Sentry (nécessite votre clé)
- Vous fournissez la clé publique Sentry (DSN) → je l'ajoute à la configuration.
- Vérifier qu'une erreur de test remonte bien dans Sentry.

## Étape 6 — Mot de passe admin (nécessite votre choix)
- Vous choisissez un nouveau mot de passe et le changez via l'onglet Sécurité (ne pas l'écrire dans la discussion).

## Étape 7 — Vérifications finales
- Relancer l'ensemble des tests unitaires et E2E.
- Revérifier mobile et tablette sur les écrans modifiés.
- Mettre à jour le document « Situation de lancement ».

## Hors périmètre (reportés volontairement)
- Activation des paiements Stripe/Paddle : avant le 01/01/2027.
- Email de campagne de fin de période gratuite : nécessite un service d'envoi en masse (Brevo, Mailchimp…) ; le rappel intégré à l'application reste en place.

## Livrable
Application et back-office à 100 %, tests au vert, prêts pour publication. Les étapes 5 et 6 restent bloquées tant que vous ne fournissez pas la clé Sentry et le nouveau mot de passe.
