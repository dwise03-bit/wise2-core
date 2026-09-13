'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AIRouterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">🤖</div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                WISE² AI Router
              </h1>
              <p className="text-xl text-slate-300 mt-2">Credit-Saver Engine • Local-First Intelligence</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-lg p-4">
            <p className="text-slate-300">
              Intelligent routing with local-first inference, Second Brain context enrichment, and unified wearable support.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>⚡</span> Local-First Routing
              </CardTitle>
              <CardDescription>Prioritize on-device inference</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              Ollama integration for instant local processing. Cloud fallback only when necessary or explicitly requested.
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>💰</span> Budget Enforcement
              </CardTitle>
              <CardDescription>4-tier cost control system</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              50% warn → 70% compress → 85% restrict → 100% brake. Automatic context reduction under budget pressure.
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🧠</span> Second Brain Integration
              </CardTitle>
              <CardDescription>Knowledge-enriched responses</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              Automatic prompt enrichment with relevant context from your knowledge base. RAG-powered intelligence.
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📊</span> Telemetry & Metrics
              </CardTitle>
              <CardDescription>Production observability</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              PostgreSQL event logging, Prometheus metrics, audit trail. Compliance-ready PII redaction.
            </CardContent>
          </Card>
        </div>

        {/* Endpoints */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">API Endpoints</h2>
          <div className="grid gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="font-mono text-lg">POST /api/generate</CardTitle>
                <CardDescription>Generate AI response with routing</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300 font-mono text-sm">
                <div className="bg-slate-900/50 p-4 rounded border border-slate-700 overflow-x-auto">
                  {`{
  "project_id": "my-project",
  "agent_id": "assistant",
  "messages": [{"role": "user", "content": "..."}],
  "route_mode": "AUTO" | "LOCAL" | "CLOUD",
  "priority": "normal" | "critical"
}`}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="font-mono text-lg">GET /api/status</CardTitle>
                <CardDescription>Check budget and router status</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300">
                Returns: daily_budget, used, remaining, used_pct, threshold
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="font-mono text-lg">GET /api/models</CardTitle>
                <CardDescription>List available models</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300">
                Returns: Array of model names, capabilities, and costs
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="font-mono text-lg">GET /health</CardTitle>
                <CardDescription>System health check</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300">
                Returns: ok, status, provider health, dependency status
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Configuration */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Configuration</h2>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 font-mono text-sm">
              <div className="bg-slate-900/50 p-4 rounded border border-slate-700 space-y-2 overflow-x-auto">
                <div>ROUTER_PORT=3100</div>
                <div>OLLAMA_API_URL=http://127.0.0.1:11434</div>
                <div>SECOND_BRAIN_URL=http://127.0.0.1:3012</div>
                <div>DATABASE_URL=postgresql://...</div>
                <div>DAILY_BUDGET_USD=50</div>
                <div>TELEMETRY_ENABLED=true</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-blue-400">6</div>
              <p className="text-slate-300 mt-2">API Endpoints</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 border-cyan-500/30">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-cyan-400">∞</div>
              <p className="text-slate-300 mt-2">Models (via Ollama)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-purple-400">4</div>
              <p className="text-slate-300 mt-2">Budget Tiers</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-green-400">24/7</div>
              <p className="text-slate-300 mt-2">Uptime</p>
            </CardContent>
          </Card>
        </div>

        {/* Status */}
        <div>
          <h2 className="text-3xl font-bold mb-6">System Status</h2>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Router Service</span>
                  <span className="text-green-400 font-semibold">● Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Local Inference</span>
                  <span className="text-green-400 font-semibold">● Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Second Brain</span>
                  <span className="text-green-400 font-semibold">● Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Telemetry</span>
                  <span className="text-amber-400 font-semibold">● Optional</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
