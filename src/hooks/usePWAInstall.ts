import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function usePWAInstall() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferred) {
      alert("To install FUFA TV: on iOS tap the Share button in Safari, then 'Add to Home Screen'.");
      return;
    }
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setCanInstall(false);
  };

  return { canInstall, install };
}
