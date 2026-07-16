import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TransportBar from "@/components/TransportBar";
import { PlayerProvider } from "@/context/PlayerContext";

export default function Shell() {
  return (
    <PlayerProvider>
      <div className="h-screen flex bg-bg-base overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto pb-24">
            <Outlet />
          </main>
          <TransportBar />
        </div>
      </div>
    </PlayerProvider>
  );
}
