import React from "react";

export default function PageScaffold({ icon: Icon, title, sub, actions, children }) {
  return (
    <div className="p-5 space-y-5" data-testid={`page-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-11 h-11 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
              <Icon className="w-5 h-5 text-neon-cyan" />
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-wide uppercase">{title}</h1>
            <p className="text-xs text-slate-500 tracking-wide">{sub}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      {children}
    </div>
  );
}

export function Card({ className = "", children, ...rest }) {
  return <div className={`panel panel-hover p-4 ${className}`} {...rest}>{children}</div>;
}

export function StatTile({ label, value, accent = "text-neon-cyan" }) {
  return (
    <div className="panel p-4">
      <div className={`font-display text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-[10px] text-slate-500 tracking-widest uppercase mt-1">{label}</div>
    </div>
  );
}
