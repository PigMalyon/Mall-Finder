export type Floor = 'ground' | 'upper';

export type Place = {
  id: string;
  name: string;
  category: string;
  floor: Floor;
  icon: string;
  nodeId: string;
  keywords: string[];
};

export const places: Place[] = [
  { id: 'woolworths', name: 'Woolworths', category: 'Department store', floor: 'ground', icon: 'W', nodeId: 'wool', keywords: ['food', 'fashion', 'clothing', 'groceries', 'home'] },
  { id: 'dischem', name: 'Dis-Chem', category: 'Health & beauty', floor: 'ground', icon: 'Rx', nodeId: 'dischem', keywords: ['medicine', 'pharmacy', 'beauty', 'baby', 'chemist'] },
  { id: 'adidas', name: 'Adidas', category: 'Footwear', floor: 'ground', icon: 'A', nodeId: 'adidas', keywords: ['shoes', 'sneakers', 'sport', 'trainers'] },
  { id: 'food-court', name: 'Food Court', category: 'Food', floor: 'ground', icon: '🍽', nodeId: 'food', keywords: ['lunch', 'restaurant', 'coffee', 'takeaway'] },
  { id: 'ground-toilets', name: 'Ground-floor toilets', category: 'Facility', floor: 'ground', icon: 'WC', nodeId: 'toilets-ground', keywords: ['toilet', 'bathroom', 'restroom', 'loo', 'wc'] },
  { id: 'atm-court', name: 'ATM Court', category: 'Banking', floor: 'ground', icon: 'ATM', nodeId: 'atm', keywords: ['cash', 'bank', 'money', 'withdrawal'] },
  { id: 'information-desk', name: 'Information Desk', category: 'Facility', floor: 'ground', icon: 'i', nodeId: 'info', keywords: ['help', 'information', 'customer service', 'lost and found'] },
  { id: 'baby-change', name: 'Baby Changing Room', category: 'Facility', floor: 'ground', icon: 'BB', nodeId: 'baby', keywords: ['baby', 'nappy', 'changing', 'parents'] },
  { id: 'accessible-lift', name: 'Accessible Lift', category: 'Facility', floor: 'ground', icon: '↕', nodeId: 'n2', keywords: ['lift', 'elevator', 'wheelchair', 'accessible'] },
  { id: 'kfc', name: 'KFC', category: 'Outside restaurant', floor: 'ground', icon: 'KFC', nodeId: 'kfc', keywords: ['chicken', 'takeaway', 'food', 'outside'] },
  { id: 'mcdonalds', name: "McDonald's", category: 'Outside restaurant', floor: 'ground', icon: 'M', nodeId: 'mcd', keywords: ['burgers', 'takeaway', 'food', 'outside'] },
  { id: 'econofoods', name: 'Econofoods', category: 'Outside store', floor: 'ground', icon: 'E', nodeId: 'econo', keywords: ['groceries', 'frozen food', 'outside', 'supermarket'] },
  { id: 'john-dorys', name: "John Dory's", category: 'Restaurant', floor: 'upper', icon: 'JD', nodeId: 'john', keywords: ['seafood', 'restaurant', 'food'] },
  { id: 'ster-kinekor', name: 'Ster-Kinekor', category: 'Entertainment', floor: 'upper', icon: 'SK', nodeId: 'cinema', keywords: ['cinema', 'movies', 'film', 'entertainment'] },
  { id: 'upper-toilets', name: 'Upper-level toilets', category: 'Facility', floor: 'upper', icon: 'WC', nodeId: 'toilets', keywords: ['toilet', 'bathroom', 'restroom', 'loo'] }
];

export const nodes: Record<string, [number, number]> = {
  west: [70, 220], w1: [145, 220], w2: [225, 210], hub: [300, 205], e1: [390, 220], east: [520, 285],
  south: [300, 365], s1: [300, 285], north: [315, 45], n1: [315, 105], n2: [310, 155],
  wool: [455, 245], dischem: [190, 265], adidas: [205, 185], food: [205, 125],
  'toilets-ground': [145, 125], atm: [430, 120], info: [335, 245], baby: [145, 155],
  kfc: [380, 340], mcd: [455, 340], econo: [525, 340]
};

export const edges: [string, string][] = [
  ['west','w1'],['w1','w2'],['w2','hub'],['hub','e1'],['e1','east'],
  ['south','s1'],['s1','hub'],['north','n1'],['n1','n2'],['n2','hub'],
  ['e1','wool'],['w2','dischem'],['w2','adidas'],['w2','food'],
  ['food','toilets-ground'],['food','baby'],['e1','atm'],['hub','info'],
  ['s1','kfc'],['s1','mcd'],['s1','econo']
];