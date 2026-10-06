# API

## `GET /api/health`
Health check.

## `GET /api/plans`
Returns mock plan / entitlement states.

## `GET /api/titles?q=蜘蛛人`
Searches the mock catalog by title or alias.

## `GET /api/titles/:id/entitlement?entitlement=monthly`
Runs entitlement evaluation for one mock title.

## `POST /api/chat`
`application/json`

Fields:
- `message`: user text
- `entitlement`: `monthly | four | both | none | unknown`
- `image`: optional `{ name, type, dataUrl }` image attachment. The MVP validates receipt but does not persist it.

The endpoint searches mock title data, evaluates rights, and returns a polite structured reply.
