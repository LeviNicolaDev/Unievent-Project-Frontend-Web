import { useEffect, useRef } from 'react';

// Keep an open dashboard in sync with registrations made on other devices.
export function useDashboardRefresh(load, setData, setError, resourceKey = '') {
  const loader = useRef(load);
  loader.current = load;
  useEffect(() => {
    let active = true;
    let pending = false;
    async function refresh() {
      if (pending || document.hidden) return;
      pending = true;
      try {
        const data = await loader.current();
        if (active) { setData(data); setError(''); }
      } catch (error) {
        if (active) setError(error.message);
      } finally { pending = false; }
    }
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [resourceKey, setData, setError]);
}
