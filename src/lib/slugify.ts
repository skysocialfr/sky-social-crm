// Slug helper used by the custom fields editor to derive a stable
// machine-readable key from a user-typed label. We dedupe against the
// existing keys so two sections with the same label end up with
// distinct keys (Note moyenne → note_moyenne, then note_moyenne_2…).
//
// Kept here (and not inside CustomFieldsEditor) so it can be unit-
// tested without rendering the editor and reused if we ever add a
// CSV-import-based bulk field creator.

export function slugify(label: string, existing: Set<string>): string {
  const base = label
    .toLowerCase()
    .normalize('NFD')
    // Strip diacritics (À, é, ç, …) by removing combining marks. The
    // character class targets U+0300..U+036F (Combining Diacritical Marks).
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    || 'champ'
  let key = base
  let i = 2
  while (existing.has(key)) {
    key = `${base}_${i++}`
  }
  return key
}
