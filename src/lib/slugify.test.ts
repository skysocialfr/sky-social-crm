import { describe, it, expect } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  const empty = () => new Set<string>()

  it('lowercases and replaces spaces with underscores', () => {
    expect(slugify('Note Moyenne', empty())).toBe('note_moyenne')
  })

  it('strips French diacritics', () => {
    expect(slugify('Spécialité principale', empty())).toBe('specialite_principale')
    expect(slugify('Années d\'expérience', empty())).toBe('annees_d_experience')
    expect(slugify('Événementiel', empty())).toBe('evenementiel')
    expect(slugify('Société à responsabilité', empty())).toBe('societe_a_responsabilite')
  })

  it('collapses consecutive non-alphanumeric runs into a single underscore', () => {
    expect(slugify('a  -  b', empty())).toBe('a_b')
    expect(slugify('foo / bar / baz', empty())).toBe('foo_bar_baz')
  })

  it('trims leading and trailing underscores', () => {
    expect(slugify('  hello world  ', empty())).toBe('hello_world')
    expect(slugify('!@#hello@#!', empty())).toBe('hello')
  })

  it('falls back to "champ" when the label has no usable characters', () => {
    expect(slugify('', empty())).toBe('champ')
    expect(slugify('!!!', empty())).toBe('champ')
    expect(slugify('   ', empty())).toBe('champ')
  })

  it('dedupes against an existing set by appending _N', () => {
    const existing = new Set(['note_moyenne'])
    expect(slugify('Note moyenne', existing)).toBe('note_moyenne_2')
  })

  it('keeps incrementing the suffix until it finds a free slot', () => {
    const existing = new Set(['rating', 'rating_2', 'rating_3'])
    expect(slugify('Rating', existing)).toBe('rating_4')
  })

  it('preserves digits in the slug', () => {
    expect(slugify('Note sur 5', empty())).toBe('note_sur_5')
    expect(slugify('CA 2024', empty())).toBe('ca_2024')
  })
})
