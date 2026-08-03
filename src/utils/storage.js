
const memory = new Map();

export function getBest() {
  try {
    return Number(window.localStorage.getItem('orbit-dash-best') || 0);
  } catch {
    return Number(memory.get('best') || 0);
  }
}

export function setBest(score) {
  try {
    window.localStorage.setItem('orbit-dash-best', String(score));
  } catch {
    memory.set('best', score);
  }
}
