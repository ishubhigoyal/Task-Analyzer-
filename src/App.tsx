import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ProjectsList from "./pages/ProjectsList";
import ProjectDetails from "./pages/ProjectDetails";
import TasksList from "./pages/TasksList";
import TaskDetails from "./pages/TaskDetails";
import ProfilePage from "./pages/ProfilePage";
import MembersList from "./pages/MembersList";
import DashboardLayout from "./layouts/DashboardLayout";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/projects" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProjectsList />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/projects/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProjectDetails />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tasks" element={
        <ProtectedRoute>
          <DashboardLayout>
            <TasksList />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tasks/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <TaskDetails />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProfilePage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/members" element={
        <ProtectedRoute>
          <DashboardLayout>
            <MembersList />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<div className="flex items-center justify-center h-screen">404 - Not Found</div>} />
    </Routes>
  );
}
