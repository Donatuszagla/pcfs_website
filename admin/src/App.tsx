import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import { AdminShell } from "./components/AdminShell";
import { FullScreenStatus } from "./components/UI";
import { ContentEditorPage } from "./pages/ContentEditorPage";
import { ContentListPage } from "./pages/ContentListPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";

export function App() {
  const auth = useAuth();
  if (auth.loading) return <FullScreenStatus label="Restoring secure session…" />;
  if (!auth.actor) return <Routes><Route path="*" element={<LoginPage />} /></Routes>;

  return (
    <AdminShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/content/:kind" element={<ContentListPage />} />
        <Route path="/content/:kind/:id" element={<ContentEditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminShell>
  );
}
