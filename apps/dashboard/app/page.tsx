import SecondBrainPage from './second-brain/page';

export const metadata = {
  title: 'WISE² Command Center',
  description: 'WISE² business memory, context, and operating signals',
};

export default function Home() {
  return (
    <main className="w-full h-screen">
      <SecondBrainPage />
    </main>
  );
}
