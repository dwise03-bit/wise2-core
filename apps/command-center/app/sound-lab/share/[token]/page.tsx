'use client';

import { useParams } from 'next/navigation';
import StudioWorkspace from '../../../../src/components/sound-lab/StudioWorkspace';

export default function SoundLabShareReviewPage() {
  const params = useParams();
  const token = params?.token as string;
  if (!token) return null;
  return <StudioWorkspace shareToken={token} clientMode />;
}
