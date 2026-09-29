import { company, wise2 } from '@/lib/sencere/config';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { BLACKHAIL_SITE_URL } from '@/lib/site-domains';

export const blakkhailBrand = {
  name: 'Blakk Hail',
  legalName: company.name,
  tagline: company.tagline,
  motto: 'Take Control • No Apologies',
  established: '1994',
  siteUrl: BLACKHAIL_SITE_URL,
  location: company.location,
  phone: company.phone,
  email: BLAKKHAIL_LEGACY.email,
  social: BLAKKHAIL_LEGACY.social,
  parentSiteUrl: `https://${company.website}`,
  parentPath: '/sencere',
  wise2: wise2,
} as const;
