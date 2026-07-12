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
  { id: 'woolworths', name: 'Woolworths', category: 'Department store', floor: 'ground', icon: 'W', nodeId: 'wool', keywords: ['food', 'fashion', 'clothing', 'groceries'] },
  { id: 'dischem', name: 'Dis-Chem', category: 'Health & beauty', floor: 'ground', icon: 'Rx', nodeId: 'dischem', keywords: ['medicine', 'pharmacy', 'beauty', 'baby'] },
  { id: 'adidas', name: 'Adidas', category: 'Footwear', floor: 'ground', icon: 'A', nodeId: 'adidas', keywords: ['shoes', 'sneakers', 'sport', 'trainers'] },
  { id: 'food-court', name: 'Food Court', category: 'Food', floor: 'ground', icon: '🍽', nodeId: 'food', keywords: ['lunch', 'restaurant', 'coffee', 'takeaway'] },
  { id: 'ground-toilets', name: 'Ground-floor toilets', category: 'Facility', floor: 'ground', icon: 'WC', nodeId: 'food', keywords: ['toilet', 'bathroom', 'restroom', 'loo'] },
  { id: 'atm', name: 'ATM', category: 'Facility', floor: 'ground', icon: 'ATM', nodeId: 'hub', keywords: ['cash', 'bank', 'money', 'banking'] },
  { id: 'information', name: 'Information Desk', category: 'Facility', floor: 'ground', icon: 'i', nodeId: 'hub', keywords: ['help', 'customer service', 'lost and found'] },
  { id: 'accessible-lift', name: 'Accessible Lift', category: 'Facility', floor: 'ground', icon: '↕', nodeId: 'n2', keywords: ['lift', 'elevator', 'wheelchair', 'accessible'] },
  { id: 'john-dorys', name: "John Dory's", category: 'Restaurant', floor: 'upper', icon: 'JD', nodeId: 'john', keywords: ['seafood', 'restaurant', 'food'] },
  { id: 'upper-toilets', name: 'Upper-level toilets', category: 'Facility', floor: 'upper', icon: 'WC', nodeId: 'toilets', keywords: ['toilet', 'bathroom', 'restroom', 'loo'] }
];

export const nodes: Record<string, [number, number]> = {
  west: [70, 220], w1: [145, 220], w2: [225, 210], hub: [300, 205], e1: [390, 220], east: [520, 285],
  south: [300, 365], s1: [300, 285], north: [315, 45], n1: [315, 105], n2: [310, 155],
  wool: [455, 245], dischem: [190, 265], adidas: [205, 185], food: [205, 125]
};

export const edges: [string, string][] = [
  ['west','w1'],['w1','w2'],['w2','hub'],['hub','e1'],['e1','east'],
  ['south','s1'],['s1','hub'],['north','n1'],['n1','n2'],['n2','hub'],
  ['e1','wool'],['w2','dischem'],['w2','adidas'],['w2','food']
];