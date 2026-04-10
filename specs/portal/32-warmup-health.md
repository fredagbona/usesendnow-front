# SPEC — Portal / Warmup & Instance Health V1
App: portal
Routes: `/instances/[id]`, `/campaigns`, `/campaigns/[id]`
Auth: required
Status: ready

---

## Purpose
Exposer la V1 du système de warmup/safety côté portal sans blocage dur :
- afficher la santé d’une instance
- afficher des warnings et recommandations avant création/reprise de campagne
- ne jamais empêcher l’action en V1, uniquement prévenir

---

## Endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/instances/{id}/health | JWT | Charger la santé de l’instance |
| POST | /api/campaigns | JWT | Créer une campagne + recevoir les hints safety |
| PATCH | /api/campaigns/{id}/resume | JWT | Reprendre une campagne + recevoir les hints safety |

---

## Contrat health
Response `GET /api/instances/{id}/health` :
```json
{
  "data": {
    "instanceId": "inst_uuid",
    "safetyState": "warming",
    "safetyScore": 56,
    "firstConnectedAt": "2026-04-10T08:00:00.000Z",
    "warmupPolicy": {
      "state": "warming",
      "instanceAgeDays": 1.4,
      "hourlyOutboundCap": 25,
      "dailyOutboundCap": 100,
      "hourlyUniqueRecipientsCap": 25,
      "dailyUniqueRecipientsCap": 100,
      "maxCampaignRecipients": 100,
      "maxColdRatio": 0.4
    },
    "usageWindowSummary": {
      "outbound1h": 4,
      "outbound24h": 18,
      "uniqueRecipients1h": 4,
      "uniqueRecipients24h": 16,
      "inboundReplies24h": 2,
      "inboundReplies7d": 3
    },
    "recommendations": [
      "Start with previously engaged contacts before scaling volume."
    ]
  }
}
```

---

## Contrat campaign safety
Response `POST /api/campaigns` et `PATCH /api/campaigns/{id}/resume` :
```json
{
  "data": {
    "id": "cmp_uuid",
    "status": "scheduled",
    "safety": {
      "decision": "warn",
      "riskLevel": "medium",
      "score": 56,
      "state": "warming",
      "reasons": [
        "This instance is still warming up and campaign pacing should stay gradual."
      ],
      "recommendations": [
        "Start with previously engaged contacts before scaling volume."
      ],
      "appliedLimits": {
        "hourlyOutboundCap": 25,
        "dailyOutboundCap": 100,
        "maxCampaignRecipients": 100,
        "maxColdRatio": 0.4
      },
      "audience": {
        "totalRecipients": 120,
        "warmCount": 18,
        "coldCount": 75,
        "unknownCount": 27,
        "blockedCount": 0,
        "coldRatio": 0.625,
        "warmRatio": 0.15,
        "unknownRatio": 0.225
      }
    }
  }
}
```

---

## UI attendue
### Instance detail
- Ajouter une `InstanceHealthCard` sous la `ConnectionCard`
- afficher :
  - `safetyState`
  - `safetyScore`
  - `firstConnectedAt`
  - `hourlyOutboundCap`
  - `dailyOutboundCap`
  - `maxCampaignRecipients`
  - `usageWindowSummary`
  - `recommendations`

### Campaign modal
- Après sélection de `instanceId` + `recipients`, la création peut retourner `safety`
- Si `safety.decision === "warn"` :
  - afficher un bloc non bloquant en jaune/orange
  - titre recommandé : `Warmup guidance`
  - afficher `riskLevel`, `reasons`, `recommendations`
  - afficher aussi les caps utiles (`maxCampaignRecipients`, `maxColdRatio`)

### Resume campaign
- Si le resume renvoie `safety.decision === "warn"` :
  - toast informatif + bannière inline sur la page détail
  - ne pas bloquer le resume en V1

---

## Règles UX importantes
- Ne jamais présenter cela comme un blocage en V1
- Ne jamais dire “spam detection blocked your campaign”
- Toujours parler de :
  - `warmup`
  - `guidance`
  - `risk`
  - `recommendations`
- Si `decision === "allow"`, ne pas afficher de gros bloc visuel
- Si `decision === "warn"`, utiliser un composant compact, lisible, non anxiogène

---

## Messages frontend recommandés
- `This instance is still warming up. Keep send volume gradual and start with engaged contacts.`
- `This campaign is allowed, but its audience is riskier than recommended for the current warmup stage.`
- `Reduce the cold-contact share or split this campaign into smaller batches for safer delivery.`

---

## Out of scope V1
- Blocage dur de campagne
- Throttling automatique visible côté UI
- Courbe historique de score
- Event log complet des `SafetyEvent`
