# Tests backend SeenIt

Ce backend inclut maintenant plusieurs types de tests automatises pour valider le comportement sans appeler TMDB en reel.

## Types de tests couverts

1. Tests unitaires middleware
- Fichier: `tests/unit/errorHandler.test.ts`
- Couvre `AppError`, `asyncHandler`, et `errorHandler` (erreurs applicatives, erreurs Zod, erreurs inconnues).

2. Tests unitaires controller
- Fichier: `tests/unit/search.controller.test.ts`
- Couvre `searchByQuery` avec mock du service TMDB:
  - cas nominal,
  - validation d'entree,
  - propagation d'erreur service.

3. Tests unitaires service
- Fichier: `tests/unit/tmdb.service.test.ts`
- Couvre la couche `tmdb.service` via mock de `fetch`:
  - payload valide,
  - erreur HTTP TMDB,
  - payload invalide (erreur Zod),
  - erreur reseau.

4. Tests d'integration API
- Fichier: `tests/integration/app.routes.test.ts`
- Couvre l'application Express montee dans `app.ts`:
  - route de sante `GET /api/health`,
  - route inconnue (404).

## Stack de test

- Framework: Vitest
- HTTP integration: Supertest
- Coverage: V8 (`@vitest/coverage-v8`)

Configuration centrale: `vitest.config.ts`
Initialisation test: `tests/setup.ts`

## Commandes

Depuis la racine `seenit-backend`:

```bash
npm run test
npm run test:watch
npm run test:coverage
```

## Bonnes pratiques appliquees

- Isolation des appels externes: `fetch` est mocke dans les tests de service.
- Determinisme: pas d'appel reseau reel dans les tests unitaires.
- Validation des erreurs: tests explicites des branches d'erreur pour fiabiliser la gestion d'exception.
