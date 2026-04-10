/**
 * Traduction côté frontend des messages safety/warmup renvoyés par le backend.
 * Si un message n'est pas dans le dictionnaire, il est affiché tel quel.
 */

const REASON_TRANSLATIONS: Record<string, string> = {
  "this instance is still warming up and campaign pacing should stay gradual.":
    "Cette instance est encore en phase de warmup. Le rythme d'envoi doit rester progressif.",
  "this campaign is allowed, but its audience is riskier than recommended for the current warmup stage.":
    "Cette campagne est autorisée, mais son audience présente un risque plus élevé que recommandé pour le stade de warmup actuel.",
  "the cold-contact ratio exceeds the recommended threshold for this instance.":
    "La proportion de contacts froids dépasse le seuil recommandé pour cette instance.",
  "the campaign volume exceeds the recommended cap for this warmup stage.":
    "Le volume de la campagne dépasse le plafond recommandé pour ce stade de warmup.",
  "this instance has not been connected long enough for stable delivery.":
    "Cette instance n'est pas connectée depuis assez longtemps pour une délivrabilité stable.",
  "the audience contains a high proportion of unknown contacts.":
    "L'audience contient une proportion élevée de contacts inconnus.",
}

const RECOMMENDATION_TRANSLATIONS: Record<string, string> = {
  "start with previously engaged contacts before scaling volume.":
    "Commencez par les contacts précédemment engagés avant d'augmenter le volume.",
  "reduce the cold-contact share or split this campaign into smaller batches for safer delivery.":
    "Réduisez la part de contacts froids ou divisez cette campagne en lots plus petits pour une délivrabilité plus sûre.",
  "consider warming up the instance gradually before sending large campaigns.":
    "Envisagez de chauffer progressivement l'instance avant d'envoyer de grandes campagnes.",
  "monitor reply rates and adjust volume based on engagement.":
    "Surveillez les taux de réponse et ajustez le volume en fonction de l'engagement.",
  "keep send volume gradual and start with engaged contacts.":
    "Maintenez un volume d'envoi progressif et commencez par les contacts engagés.",
  "use previously successful audience segments for safer delivery.":
    "Utilisez les segments d'audience ayant déjà fonctionné pour une délivrabilité plus sûre.",
}

function translateMessage(text: string, dict: Record<string, string>): string {
  const lower = text.trim().toLowerCase()
  if (dict[lower]) return dict[lower]
  return text
}

export function translateReason(text: string): string {
  return translateMessage(text, REASON_TRANSLATIONS)
}

export function translateRecommendation(text: string): string {
  return translateMessage(text, RECOMMENDATION_TRANSLATIONS)
}
