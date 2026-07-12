import type { Place } from './data';

const synonymGroups: Record<string, string[]> = {
  toilet: ['bathroom', 'restroom', 'loo', 'wc'],
  bathroom: ['toilet', 'restroom', 'loo', 'wc'],
  pharmacy: ['medicine', 'chemist', 'prescription'],
  medicine: ['pharmacy', 'chemist', 'prescription'],
  food: ['restaurant', 'lunch', 'dinner', 'coffee', 'takeaway'],
  restaurant: ['food', 'lunch', 'dinner', 'takeaway'],
  shoes: ['sneakers', 'footwear', 'trainers'],
  clothing: ['fashion', 'clothes', 'apparel'],
  cash: ['atm', 'bank', 'money', 'withdrawal'],
  atm: ['cash', 'bank', 'money', 'withdrawal'],
  movies: ['cinema', 'film', 'entertainment'],
  cinema: ['movies', 'film', 'entertainment'],
  baby: ['nappy', 'changing', 'parents'],
  help: ['information', 'customer service', 'lost and found'],
  wheelchair: ['accessible', 'lift', 'elevator'],
  groceries: ['supermarket', 'food', 'frozen']
};

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function expandedTerms(query: string) {
  const terms = normalise(query).split(/\s+/).filter(Boolean);
  return Array.from(new Set(terms.flatMap((term) => [term, ...(synonymGroups[term] ?? [])])));
}

export function searchPlaces(places: Place[], query: string) {
  const terms = expandedTerms(query);
  if (!terms.length) return places.slice(0, 5);

  return places
    .map((place) => {
      const name = normalise(place.name);
      const category = normalise(place.category);
      const keywords = normalise(place.keywords.join(' '));
      const score = terms.reduce((total, term) => {
        if (name === term) return total + 100;
        if (name.startsWith(term)) return total + 70;
        if (name.includes(term)) return total + 50;
        if (category.includes(term)) return total + 30;
        if (keywords.includes(term)) return total + 20;
        return total;
      }, 0);
      return { place, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name))
    .map(({ place }) => place);
}