// src/app/layout.tsx
import React from 'react';

export const metadata = {
  title: 'Loopin Chat',
  description: 'Chat with Loopin AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
              <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
