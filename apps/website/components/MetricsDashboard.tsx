"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";

const metrics = [
  {
    label: "Live Deployments",
    value: "500+",
    change: "+12% this month",
    icon: Zap,
    color: "from-cyan-500 to-blue-500",
    detail: "Active systems in production",
  },
  {
    label: "System Uptime",
    value: "99.7%",
    change: "Zero scheduled downtime",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500",
    detail: "Multi-region redundancy",
  },
  {
    label: "Active Users",
    value: "2,000+",
    change: "+200 new users this week",
    icon: Users,
    color: "from-orange-500 to-red-500",
    detail: "Across 8 industries",
  },
  {
    label: "Global Coverage",
    value: "35+",
    change: "Data centers worldwide",
    icon: Globe,
    color: "from-purple-500 to-pink-500",
    detail: "12 cloud regions",
  },
];

const recentActivity = [
  { time: "2 mins ago", action: "New deployment", project: "HVAC Intelligence v2.1" },
  { time: "15 mins ago", action: "Scale event", project: "AI Phone system (East region)" },
  { time: "47 mins ago", action: "Health check passed", project: "All systems nominal" },
  { time: "2 hours ago", action: "Feature rollout", project: "Field Tech mobile app" },
];

export function MetricsDashboard() {
  const [animateMetrics, setAnimateMetrics] = useState(false);

  useEffect(() => {
    setAnimateMetrics(true);
  }, []);

  return (
    <section className="w-full bg-gradient-to-b from-slate-950 to-slate-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-cyan-400 text-sm font-mono uppercase tracking-widest mb-4">
            Real-Time Visibility
          </p>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            System Health Dashboard
          </h2>
          <p className="text-gray-300 text-lg">
            Live metrics from production systems serving real businesses in real time.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={animateMetrics ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity blur`} />
                <div className="relative bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-colors">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center mb-4 text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Label */}
                  <p className="text-sm text-gray-400 mb-2">{metric.label}</p>

                  {/* Value */}
                  <p className="text-3xl font-bold text-white mb-1">{metric.value}</p>

                  {/* Change */}
                  <p className="text-sm text-cyan-400 font-semibold mb-3">{metric.change}</p>

                  {/* Detail */}
                  <p className="text-xs text-gray-500">{metric.detail}</p>

                  {/* Live indicator */}
                  <div className="mt-4 flex items-center text-xs text-green-400 font-mono">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                    Live
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={animateMetrics ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-start space-x-4 pb-4 border-b border-slate-700/50 last:border-0"
                >
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{activity.action}</p>
                    <p className="text-gray-400 text-sm">{activity.project}</p>
                    <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Key Stats */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Key Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">API Response Time</span>
                  <span className="text-sm font-bold text-cyan-400">45ms</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full w-1/3" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Database Health</span>
                  <span className="text-sm font-bold text-green-400">Optimal</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Infrastructure Load</span>
                  <span className="text-sm font-bold text-orange-400">64%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
