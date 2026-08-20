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
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <style>{`
          html, body {
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
      </head>
      <body className="bg-black">
        {children}
      </body>
    </html>
  );
}
