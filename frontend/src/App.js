import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";
import Login from "@/pages/Login";
import SoundLabs from "@/pages/SoundLabs";
import PlaceholderPage from "@/pages/PlaceholderPage";
import Shell from "@/components/Shell";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg-base">
        <div className="text-neon-cyan font-display animate-pulse">Initializing WISE² …</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster theme="dark" position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Shell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/sound-labs" replace />} />
            <Route path="dashboard" element={<PlaceholderPage title="Dashboard" />} />
            <Route path="ai" element={<PlaceholderPage title="AI" />} />
            <Route path="sound-labs" element={<SoundLabs />} />
            <Route path="business" element={<PlaceholderPage title="Business" />} />
            <Route path="infrastructure" element={<PlaceholderPage title="Infrastructure" />} />
            <Route path="deployments" element={<PlaceholderPage title="Deployments" />} />
            <Route path="cyber-security" element={<PlaceholderPage title="Cyber Security" />} />
            <Route path="communications" element={<PlaceholderPage title="Communications" />} />
            <Route path="storage" element={<PlaceholderPage title="Storage" />} />
            <Route path="inventory" element={<PlaceholderPage title="Inventory" />} />
            <Route path="fleet" element={<PlaceholderPage title="Fleet" />} />
            <Route path="training" element={<PlaceholderPage title="Training" />} />
            <Route path="projects" element={<PlaceholderPage title="Projects" />} />
            <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
            <Route path="automation" element={<PlaceholderPage title="Automation" />} />
            <Route path="store" element={<PlaceholderPage title="Store" />} />
            <Route path="finance" element={<PlaceholderPage title="Finance" />} />
            <Route path="documents" element={<PlaceholderPage title="Documents" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
