# Monitoring & alerting — PlanCraft Pro

Deux couches complémentaires :

1. **Logs internes** (table `error_logs`, visibles dans `Admin → Logs`) — toujours actifs, lisibles par les admins.
2. **Sentry** — actif uniquement si la variable `VITE_SENTRY_DSN` est renseignée.

## Activation de Sentry

1. Créer un projet **React** sur sentry.io.
2. Copier la **DSN publique** (elle est conçue pour être exposée côté navigateur).
3. Ajouter dans le fichier `.env` à la racine :

```
VITE_SENTRY_DSN=https://<clé publique>@o<org>.ingest.sentry.io/<project>
VITE_SENTRY_ENV=production
```

4. Redéployer (les variables `VITE_*` sont injectées au build).

Sans DSN, `initSentry()` ne fait aucun appel réseau : l'app reste 100 % fonctionnelle.

## Ce qui est envoyé

- Erreurs React non rattrapées (`ErrorBoundary`), `window.onerror`, `unhandledrejection`.
- Erreurs remontées manuellement via `logError()` (miroir Sentry + `error_logs`).
- Identité : **user id uniquement** (pas d'email, `sendDefaultPii: false`) → conforme RGPD.
- Les tokens présents dans l'URL (`access_token`, `refresh_token`, `code`) sont purgés avant envoi.

## Bruit filtré

`ResizeObserver loop…`, `Failed to fetch dynamically imported module`, `AbortError`, erreurs issues d'extensions navigateur et de scripts tiers.

## Règles d'alerte recommandées (Sentry → Alerts)

| # | Règle | Condition | Canal | Sévérité |
|---|-------|-----------|-------|----------|
| 1 | Nouvelle erreur en production | `event.environment = production` ET issue vue pour la 1ʳᵉ fois | Email + Slack `#alerts` | Haute |
| 2 | Pic d'erreurs | > 20 événements sur une même issue en 5 min | Slack `#alerts` | Critique |
| 3 | Erreur touchant plusieurs comptes | > 5 utilisateurs uniques affectés en 1 h | Email | Haute |
| 4 | Régression | issue précédemment marquée « résolue » qui réapparaît | Slack | Haute |
| 5 | Erreurs financières / export | `message` contient `export`, `pdf`, `docx`, `xlsx`, `financial` | Email | Moyenne |
| 6 | Échec IA | `message` contient `ai-assist` ou statut 429/402 | Slack | Moyenne |

Fréquence de notification conseillée : au plus 1 alerte / 30 min par issue afin d'éviter le spam.

## Surveillance côté base

Dans `Admin → Logs` : badge rouge si des erreurs sont survenues dans les dernières 24 h.
Purge conseillée : supprimer les logs de plus de 90 jours (bouton de suppression admin).
