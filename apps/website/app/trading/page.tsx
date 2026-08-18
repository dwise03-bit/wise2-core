import type { Metadata } from 'next';
import { TradingLandingExperience } from './TradingLandingExperience';

export const metadata: Metadata = {
  title: 'WISE² Trading | Liquidity Raid Research, Validation, and Execution',
  description:
    'WISE² Trading is a quantitative research, validation, risk, and execution platform built around liquidity raids, structural confirmation, and disciplined deployment gates.',
};

export default function TradingPage() {
  return <TradingLandingExperience />;
}
