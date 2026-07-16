import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";
import Login from "@/pages/Login";
import Shell from "@/components/Shell";
import Dashboard from "@/pages/Dashboard";
import Studio from "@/pages/Studio";
import BrandDNA from "@/pages/BrandDNA";
import AnthemCreator from "@/pages/AnthemCreator";
import RecordingRoom from "@/pages/RecordingRoom";
import MixingConsole from "@/pages/MixingConsole";
import Mastering from "@/pages/Mastering";
import Community from "@/pages/Community";
import Challenges from "@/pages/Challenges";
import Academy from "@/pages/Academy";
import BrandVault from "@/pages/BrandVault";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#05070f]">
        <div className="neon-text font-display animate-pulse tracking-mega">INITIALIZING WISE² …</div>
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
          <Route path="/" element={<ProtectedRoute><Shell /></ProtectedRoute>}>
            <Route index element={<Navigate to="/live" replace />} />
            <Route path="live" element={<Dashboard />} />
            <Route path="studio" element={<Studio />} />
            <Route path="brand-dna" element={<BrandDNA />} />
            <Route path="anthem-creator" element={<AnthemCreator />} />
            <Route path="recording-room" element={<RecordingRoom />} />
            <Route path="mixing-console" element={<MixingConsole />} />
            <Route path="mastering" element={<Mastering />} />
            <Route path="community" element={<Community />} />
            <Route path="challenges" element={<Challenges />} />
            <Route path="academy" element={<Academy />} />
            <Route path="brand-vault" element={<BrandVault />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
