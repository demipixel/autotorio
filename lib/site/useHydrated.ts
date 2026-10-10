import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// False while the statically built page is being rendered and hydrated, true
// afterwards. Anything only the browser knows (cookies, saved settings) has
// to wait for this, or the first render would not match the built page.
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
