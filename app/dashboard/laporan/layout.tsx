'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function LaporanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        strategy="beforeInteractive"
      />
      {children}
    </>
  );
}