import { useSyncExternalStore } from "react";

type State = { on: boolean };
let state: State = { on: false };
const listeners = new Set<() => void>();

function emit() { for (const l of listeners) l(); }

export const radio = {
  toggle() { state = { on: !state.on }; emit(); },
  set(on: boolean) { if (state.on !== on) { state = { on }; emit(); } },
  get isOn() { return state.on; },
};

function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }
function getSnapshot() { return state; }

export function useRadio() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
