import { Outlet } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.js';

export function AdminLayout() {
  useTheme();

  return (
    <main className="admin-shell">
      <Outlet />
    </main>
  );
}
