'use client';

import { useParams } from 'next/navigation';
import StudioWorkspace from '../../../../src/components/sound-lab/StudioWorkspace';

export default function SoundLabStudioPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  if (!projectId) return null;
  return <StudioWorkspace projectId={projectId} />;
}
