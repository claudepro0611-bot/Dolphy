import { useEffect, useState } from "react";

// Lazy-load SDK only client-side
export function useTelegram() {
  const [tg, setTg] = useState<typeof import("@twa-dev/sdk").default | null>(null);

  useEffect(() => {
    import("@twa-dev/sdk").then((mod) => {
      const WebApp = mod.default;
      WebApp.ready();
      WebApp.expand();
      setTg(WebApp);
    });
  }, []);

  const user = tg?.initDataUnsafe?.user;

  return {
    tg,
    user,
    firstName: user?.first_name ?? "Foydalanuvchi",
    colorScheme: tg?.colorScheme ?? "dark",
  };
}
