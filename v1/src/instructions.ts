import type { Place } from './data';
import { nodes } from './data';

export type JourneyInstruction = {
  direction: '↑' | '↰' | '↱' | '✓';
  label: string;
  title: string;
  detail: string;
  milestone: number;
};

const LANDMARKS: Record<string, string> = {
  west: 'Banking Court entrance',
  w1: 'Banking Court',
  w2: 'Dis-Chem junction',
  hub: 'main atrium',
  e1: 'Woolworths corridor',
  east: 'East entrance',
  south: 'Main entrance',
  s1: 'south concourse',
  north: 'North entrance',
  n1: 'north concourse',
  n2: 'main atrium approach',
  wool: 'Woolworths',
  dischem: 'Dis-Chem',
  adidas: 'Adidas',
  food: 'Food Court'
};

function angleBetween(a: string, b: string, c: string) {
  const [ax, ay] = nodes[a];
  const [bx, by] = nodes[b];
  const [cx, cy] = nodes[c];
  const incoming = Math.atan2(by - ay, bx - ax);
  const outgoing = Math.atan2(cy - by, cx - bx);
  let delta = (outgoing - incoming) * 180 / Math.PI;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
}

function turnDirection(delta: number) {
  if (delta > 28) return { direction: '↱' as const, phrase: 'Turn right' };
  if (delta < -28) return { direction: '↰' as const, phrase: 'Turn left' };
  return { direction: '↑' as const, phrase: 'Continue straight' };
}

export function buildJourneyInstructions(route: string[], destination: Place): JourneyInstruction[] {
  if (route.length < 2) {
    return [{ direction: '✓', label: 'Journey complete', title: `Welcome to ${destination.name}`, detail: 'You are at the correct customer entrance.', milestone: 1 }];
  }

  const instructions: JourneyInstruction[] = [{
    direction: '↑',
    label: 'Start',
    title: `Continue from ${LANDMARKS[route[0]] ?? 'your entrance'}`,
    detail: `Walk towards ${LANDMARKS[route[1]] ?? 'the next corridor'}.`,
    milestone: 0
  }];

  for (let index = 1; index < route.length - 1; index += 1) {
    const previous = route[index - 1];
    const current = route[index];
    const next = route[index + 1];
    const { direction, phrase } = turnDirection(angleBetween(previous, current, next));
    instructions.push({
      direction,
      label: 'Next',
      title: `${phrase} at ${LANDMARKS[current] ?? 'the junction'}`,
      detail: `Then continue towards ${LANDMARKS[next] ?? destination.name}.`,
      milestone: index / (route.length - 1)
    });
  }

  instructions.push({
    direction: '↑',
    label: 'Almost there',
    title: `${destination.name} is ahead`,
    detail: 'Look for the highlighted customer entrance.',
    milestone: Math.max(.82, (route.length - 1.25) / (route.length - 1))
  });

  instructions.push({
    direction: '✓',
    label: 'Journey complete',
    title: `Welcome to ${destination.name}`,
    detail: 'You are at the correct customer entrance.',
    milestone: 1
  });

  return instructions.sort((a, b) => a.milestone - b.milestone);
}

export function instructionAtProgress(instructions: JourneyInstruction[], progress: number) {
  let current = instructions[0];
  for (const instruction of instructions) {
    if (progress >= instruction.milestone) current = instruction;
    else break;
  }
  return current;
}

export function nextDecisionProgress(instructions: JourneyInstruction[], progress: number) {
  return instructions.find((instruction) => instruction.milestone > progress && instruction.milestone < 1)?.milestone ?? 1;
}
