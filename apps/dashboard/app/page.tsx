import Dashboard from './components/Dashboard';

export const metadata = {
  title: 'WISE² Command Center',
  description: 'Enterprise AI Operating System Dashboard',
};

export default function Home() {
  return (
    <main className="w-full h-screen">
      <Dashboard />
    </main>
  );
}
