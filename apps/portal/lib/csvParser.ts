"use client"

/**
 * Parse un CSV de numéros de téléphone côté frontend uniquement.
 *
 * Format attendu :
 *   - 1ère ligne = header (ignorée)
 *   - 1ère colonne = numéro de téléphone
 *   - Délimiteur : virgule `,` ou point-virgule `;`
 *
 * Retourne un tableau de strings (numéros nettoyés).
 */
export function parsePhoneCsv(text: string): string[] {
  const lines = text
    .replace(/^\uFEFF/, "")       // strip BOM
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return []

  // Détecter le délimiteur (virgule ou point-virgule)
  const firstLine = lines[0]
  const delimiter = firstLine.includes(";") ? ";" : ","

  // Extraire les numéros en sautant le header (première ligne)
  const numbers: string[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter)
    const phone = cols[0]?.trim()
    if (phone) {
      numbers.push(phone)
    }
  }

  return numbers
}

/**
 * Génère le contenu d'un fichier CSV template avec une seule colonne `phone`.
 * Inclut 5 exemples de numéros (Japon, Suède, Allemagne, France) pour guider l'utilisateur.
 */
export function generatePhoneCsvTemplate(): string {
  return [
    "phone",
    "+819012345678",
    "+818098765432",
    "+46701234567",
    "+4915112345678",
    "+33612345000",
  ].join("\n") + "\n"
}

/**
 * Génère un Blob CSV prêt à télécharger.
 */
export function csvBlob(content: string): Blob {
  return new Blob([content], { type: "text/csv;charset=utf-8" })
}
