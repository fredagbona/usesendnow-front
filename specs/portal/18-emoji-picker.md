## Purpose

Permettre à l'utilisateur de cliquer sur un bouton emoji et de sélectionner
un emoji depuis une grille pour l'insérer dans un champ de texte.
Utilisé dans tous les formulaires de rédaction de message uniquement du portal.

---

## Librairie
```bash
pnpm add emoji-mart @emoji-mart/data --filter portal
```

`emoji-mart` est la référence industrie pour les emoji pickers React.
Slack, Notion, Linear l'utilisent.
Support complet Unicode, recherche, catégories, skin tones, récents.

---

## Composants à créer

### 1. EmojiPicker.tsx
`apps/portal/components/ui/EmojiPicker.tsx`

Wrapper autour de `emoji-mart` adapté au design system portal.

Props :
```tsx
interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  disabled?: boolean
}
```

Comportement :
- Bouton trigger : icône smiley face (HugeIcons `SmileIcon`)
- Clic sur le bouton → ouvre le picker en popover
- Clic sur un emoji → appelle `onEmojiSelect(emoji.native)`
  et ferme le picker
- Clic en dehors → ferme le picker
- Escape → ferme le picker

Implémentation :
```tsx
"use client"

import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { useRef, useState, useEffect } from "react"
import { SmileIcon } from "hugeicons-react"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  disabled?: boolean
}

export function EmojiPicker({ onEmojiSelect, disabled }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fermer si clic en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  // Fermer sur Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="p-2 text-[#9CA3AF] hover:text-[#6B7280]
                   hover:bg-[#F8F9FA] rounded-lg transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Insérer un emoji"
      >
        <SmileIcon className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute bottom-10 left-0 z-50 shadow-xl rounded-xl overflow-hidden">
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => {
              onEmojiSelect(emoji.native)
              setOpen(false)
            }}
            locale="fr"
            theme="light"
            previewPosition="none"
            skinTonePosition="search"
            maxFrequentRows={2}
            perLine={8}
          />
        </div>
      )}
    </div>
  )
}
```

---

### 2. MessageTextarea.tsx
`apps/portal/components/ui/MessageTextarea.tsx`

Textarea de rédaction de message avec emoji picker intégré,
compteur de caractères et gestion de l'insertion à la position du curseur.

Props :
```tsx
interface MessageTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  rows?: number
  label?: string
  error?: string
}
```

Comportement :
- Textarea standard avec le design system portal
- Bouton EmojiPicker en bas à gauche de la textarea
- Compteur de caractères en bas à droite
- L'emoji est inséré **à la position du curseur** dans le texte
  (pas forcément à la fin)
- Si `maxLength` défini → compteur devient rouge quand dépassé
- Le compteur affiche aussi le nombre d'emojis si présents
  (1 emoji = 1-2 caractères Unicode mais affiché comme 1)

Logique d'insertion à la position du curseur :
```tsx
const textareaRef = useRef<HTMLTextAreaElement>(null)

function insertEmojiAtCursor(emoji: string) {
  const textarea = textareaRef.current
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const newValue = value.substring(0, start) + emoji + value.substring(end)

  onChange(newValue)

  // Repositionner le curseur après l'emoji
  requestAnimationFrame(() => {
    textarea.focus()
    textarea.setSelectionRange(
      start + emoji.length,
      start + emoji.length
    )
  })
}
```

Layout du composant :
```
┌─────────────────────────────────────┐
│  textarea                           │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  😊  (picker button)    247 / 1024  │
└─────────────────────────────────────┘
```

Implémentation complète :
```tsx
"use client"

import { useRef } from "react"
import { EmojiPicker } from "./EmojiPicker"

interface MessageTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  rows?: number
  label?: string
  error?: string
}

export function MessageTextarea({
  value,
  onChange,
  placeholder = "Rédigez votre message...",
  maxLength,
  disabled = false,
  rows = 4,
  label,
  error,
}: MessageTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function insertEmojiAtCursor(emoji: string) {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue = value.substring(0, start) + emoji + value.substring(end)
    onChange(newValue)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }

  const isOverLimit = maxLength ? value.length > maxLength : false

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#111827]">
          {label}
        </label>
      )}

      <div className={`
        border rounded-lg overflow-hidden
        focus-within:ring-2 focus-within:ring-[#25D366]
        focus-within:border-transparent transition-all
        ${error ? "border-[#EF4444]" : "border-[#D1D5DB]"}
        ${disabled ? "opacity-50 bg-[#F8F9FA]" : "bg-white"}
      `}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className="w-full px-3 pt-3 pb-1 text-sm text-[#111827]
                     placeholder:text-[#9CA3AF] resize-none
                     focus:outline-none bg-transparent"
        />

        <div className="flex items-center justify-between px-2 pb-2">
          <EmojiPicker
            onEmojiSelect={insertEmojiAtCursor}
            disabled={disabled}
          />
          {maxLength && (
            <span className={`text-xs tabular-nums
              ${isOverLimit ? "text-[#EF4444] font-medium" : "text-[#9CA3AF]"}
            `}>
              {value.length} / {maxLength}
            </span>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-[#EF4444]">{error}</p>
      )}
    </div>
  )
}
```

---

## Où utiliser MessageTextarea

Remplacer tous les `<textarea>` de rédaction de message dans le portal
par `<MessageTextarea>`.

| Formulaire | Champ | maxLength |
|---|---|---|
| Envoyer un message (texte) | `text.body` | 4096 |
| Créer une campagne | `message.text.body` | 4096 |
| Créer un template | `body` | 4096 |
| Publier un statut (texte) | `text.body` | 700 |
| Caption image/vidéo/document | `caption` | 1024 |

---

## Configuration emoji-mart

Le picker est configuré avec :

| Option | Valeur | Raison |
|---|---|---|
| `locale` | `"fr"` | Interface en français |
| `theme` | `"light"` | Portal light mode only |
| `previewPosition` | `"none"` | Pas de preview — gain de place |
| `skinTonePosition` | `"search"` | Skin tone dans la recherche |
| `maxFrequentRows` | `2` | 2 lignes de récents max |
| `perLine` | `8` | 8 emojis par ligne |

---

## Positionnement du popover

Le picker s'ouvre **au-dessus** du bouton trigger (`bottom-10`).
Si le formulaire est en bas de page et qu'il n'y a pas de place
au-dessus, ajouter une détection de position :
```tsx
// Détecter si le picker dépasse en haut de l'écran
const [opensUpward, setOpensUpward] = useState(true)

useEffect(() => {
  if (!open || !containerRef.current) return
  const rect = containerRef.current.getBoundingClientRect()
  // Si moins de 400px au-dessus → ouvrir vers le bas
  setOpensUpward(rect.top > 400)
}, [open])

// Classe conditionnelle
className={opensUpward ? "bottom-10 left-0" : "top-10 left-0"}
```

---

## Animations (Framer Motion)
```tsx
import { AnimatePresence, motion } from "framer-motion"

{open && (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 8 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute bottom-10 left-0 z-50 shadow-xl rounded-xl overflow-hidden"
    >
      <Picker ... />
    </motion.div>
  </AnimatePresence>
)}
```

---

## Ce que le dev NE DOIT PAS faire

- Ne pas créer un picker custom from scratch — utiliser emoji-mart
- Ne pas insérer l'emoji toujours à la fin — respecter la position du curseur
- Ne pas oublier le `requestAnimationFrame` pour repositionner le curseur
- Ne pas utiliser ce composant dans la landing — portal uniquement
- Ne pas installer `emoji-mart` globalement — uniquement dans `apps/portal`

---

## Out of scope

- Support des emojis dans les messages reçus (déjà géré nativement)
- Emoji reactions sur les messages
- Custom emoji sets
- Emoji dans les noms d'instances ou labels
