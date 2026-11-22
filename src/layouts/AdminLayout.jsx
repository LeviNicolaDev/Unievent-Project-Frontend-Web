import { Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <main className="admin-shell">
      <Outlet />
    </main>
  );
}
