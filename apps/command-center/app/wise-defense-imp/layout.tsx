export const metadata = {
  title: 'WISE² Defense IMP',
  description: 'Edge Intelligence Node Dashboard',
};

export default function WiseDefenseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden" style={{ margin: 0, padding: 0 }}>
      <style>{`
        :root {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: #000;
        }
        * {
          -webkit-user-select: none;
          user-select: none;
        }
        input, textarea {
          -webkit-user-select: text;
          user-select: text;
        }
      `}</style>
      {children}
    </div>
  );
}
