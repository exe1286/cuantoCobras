import type { Profession } from './data';

export function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function editDistance(a: string, b: string) {
  if (!a) return b.length;
  if (!b) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost
      );
    }
    for (let j = 0; j <= b.length; j += 1) {
      previous[j] = current[j];
    }
  }

  return previous[b.length];
}

function getProfessionHaystack(profession: Profession) {
  return [
    profession.name,
    profession.category,
    ...(profession.keywords || []),
  ].map(normalizeSearchText);
}

export function getProfessionSearchScore(profession: Profession, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;

  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  const haystack = getProfessionHaystack(profession);
  let score = 0;

  for (const text of haystack) {
    if (text === normalizedQuery) score = Math.max(score, 120);
    if (text.startsWith(normalizedQuery)) score = Math.max(score, 95);
    if (text.includes(normalizedQuery)) score = Math.max(score, 75);

    const textWords = text.split(/\s+/).filter(Boolean);
    const matchedWords = words.filter(word => (
      textWords.some(textWord => (
        textWord.startsWith(word) ||
        textWord.includes(word) ||
        (word.length >= 4 && editDistance(word, textWord) <= 1)
      ))
    ));

    if (matchedWords.length > 0) {
      score = Math.max(score, 25 + matchedWords.length * 12);
    }
  }

  return score;
}

export function searchProfessions(professions: Profession[], query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return [...professions].sort((a, b) => a.name.localeCompare(b.name));
  }

  return professions
    .map(profession => ({
      profession,
      score: getProfessionSearchScore(profession, normalizedQuery),
    }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.profession.name.localeCompare(b.profession.name))
    .map(result => result.profession);
}

