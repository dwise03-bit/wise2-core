'use client';

import React from 'react';
import Link from 'next/link';
import { Panel } from './States';

interface DeepLink {
  label: string;
  href: string;
  description?: string;
}

interface SectionScaffoldProps {
  title: string;
  description: string;
  /** The endpoint this section will read once it exists. */
  plannedEndpoint?: string;
  links?: DeepLink[];
}

/**
 * Placeholder for Revenue OS sections whose API surface is not part of the
 * current contract (leads / pipeline / attribution / agents).
 *
 * It states plainly that the section is not wired up yet and offers deep links
 * to the existing Command Center screens that cover the same ground. It shows
 * no metrics at all — an empty scaffold is honest, a scaffold full of invented
 * numbers is not.
 */
export const SectionScaffold: React.FC<SectionScaffoldProps> = ({
  title,
  description,
  plannedEndpoint,
  links = [],
}) => (
  <Panel title={title} subtitle={description}>
    <div className="space-y-4 p-4">
      <div className="rounded-lg border border-border-subtle bg-white/[0.02] p-4">
        <p className="text-sm font-semibold text-text-secondary">Not connected yet</p>
        <p className="mt-1 text-xs text-text-muted">
          This section has no data source in the current Revenue OS API contract, so nothing is
          displayed. It will populate as soon as its endpoint ships.
        </p>
        {plannedEndpoint && (
          <p className="mt-2 font-mono text-2xs text-text-muted/80">{plannedEndpoint}</p>
        )}
      </div>

      {links.length > 0 && (
        <div className="space-y-2">
          <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-text-muted">
            Available today
          </p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-border-subtle bg-white/[0.02] p-3 transition-colors hover:border-wise-electric/40 hover:bg-wise-electric/[0.06]"
              >
                <p className="text-sm font-medium text-wise-electric">{link.label} →</p>
                {link.description && (
                  <p className="mt-0.5 text-xs text-text-muted">{link.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  </Panel>
);
