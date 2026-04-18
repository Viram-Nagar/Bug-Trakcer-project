import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import TicketsPage from "./pages/TicketsPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import KanbanPage from "./pages/KanbanPage";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected — all inside MainLayout (sidebar) */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:projectId/tickets" element={<TicketsPage />} />
        <Route
          path="/projects/:projectId/tickets/:ticketId"
          element={<TicketDetailPage />}
        />
        <Route path="/projects/:projectId/kanban" element={<KanbanPage />} />
      </Route>
      <Route
        path="*"
        element={
          <div
            className="flex flex-col items-center justify-center
                          min-h-screen text-center p-4"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              404 - Page Not Found
            </h1>
            <p className="text-gray-500 mb-6">
              The page you're looking for doesn't exist.
            </p>
            <a href="/dashboard" className="btn-primary">
              Go Home
            </a>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
