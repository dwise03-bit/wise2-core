import { redirect } from 'next/navigation';
export default function LegacyLibraryRedirect() {
  redirect('/dashboard/gallery');
}
