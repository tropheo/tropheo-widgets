'use client';

import { useState } from 'react';
import { TropheoWidgets, StandingsTable } from '@tropheo/react';
import './page.css';

export default function Home() {
  // Configuration
  const API_KEY = process.env.NEXT_PUBLIC_TROPHEO_API_KEY || 'your-api-key-here';
  const BASE_URL = process.env.NEXT_PUBLIC_TROPHEO_BASE_URL || 'https://your-tropheo-instance.com';
  const EVENT_ID = process.env.NEXT_PUBLIC_EVENT_ID || 'your-event-id-here';

  // Initialize Tropheo Widgets
  const [widgets] = useState(() => {
    return new TropheoWidgets({
      apiKey: API_KEY,
      baseUrl: BASE_URL,
    });
  });

  return (
    <div className="container">
      <header className="header">
        <h1>Tropheo Widgets - Next.js Example</h1>
        <p className="description">
          This example demonstrates how to embed Tropheo standings widget in a Next.js application.
        </p>
      </header>

      <main className="main">
        <StandingsTable
          client={widgets.getClient()}
          eventId={EVENT_ID}
          eventRole="DIVISION"
          title="Tournament Standings"
          showEmptyState={true}
          lang="en"
        />
      </main>

      <footer className="footer">
        <p>Powered by Tropheo Widgets</p>
      </footer>
    </div>
  );
}
