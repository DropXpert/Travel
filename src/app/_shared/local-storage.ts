export function subscribeToStorage(key: string, changed: string, listener: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === key || event.key === null) listener();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(changed, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changed, listener);
  };
}
