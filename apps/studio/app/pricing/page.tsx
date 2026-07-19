/**
 * Pricing Page Route
 */

import { PricingPage } from '../../components/Billing/PricingPage';

export const metadata = {
  title: 'Pricing - WISE² Studio',
  description: 'Flexible pricing plans for audio creators',
};

export default function Page() {
  return <PricingPage />;
}
