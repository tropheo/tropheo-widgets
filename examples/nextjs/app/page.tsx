'use client';

import { useState } from 'react';
import { TropheoWidgets, StandingsTable, LeaderboardTable } from '@tropheo/react';
import './page.css';

export default function Home() {
  // Read from .env.local or fall back to placeholder strings
  const API_KEY = process.env.NEXT_PUBLIC_TROPHEO_API_KEY || 'your-api-key-here';
  const BASE_URL = process.env.NEXT_PUBLIC_TROPHEO_BASE_URL || 'https://your-tropheo-instance.com';
  const EVENT_ID = process.env.NEXT_PUBLIC_EVENT_ID || 'your-event-id-here';

  const [widgets] = useState(() => {
    return new TropheoWidgets({
      apiKey: API_KEY,
      baseUrl: BASE_URL,
    });
  });

  return (
    <div className="container">
      <header className="header">
        <h1>Tropheo Widgets — Next.js Example</h1>
        <p className="description">
          Demonstrates <code>StandingsTable</code> and <code>LeaderboardTable</code> inside a
          Next.js 14 App Router page.
        </p>
      </header>

      <main className="main">
        {/* Standings — auto-detects POOL / DIVISION / TOURNAMENT_ROOT / SEASON / LEAGUE */}
        <section>
          <StandingsTable
            client={widgets.getClient()}
            eventId={EVENT_ID}
            title="Tournament Standings"
            showEmptyState={true}
            lang="en"
          />
        </section>

        {/* Stats leaderboard — column headers are clickable to sort */}
        <section style={{ marginTop: '40px' }}>
          <LeaderboardTable
            client={widgets.getClient()}
            eventId={EVENT_ID}
            scopeType="TOURNAMENT" // 'TOURNAMENT' | 'DIVISION' | 'STAGE' | 'GAMEDAY'
            sport="basketball" // 'basketball' | 'baseball' | 'softball' | 'soccer'
            facet="basketball" // basketball | batting | pitching | fielding | soccer | goalkeeping
            mode="athletes" // 'athletes' | 'teams'
            title="Top Scorers"
            showEmptyState={true}
            lang="en"
            // Optional: filter to a single team's athletes (hides Teams tab)
            // filterByOrganizationId="your-org-id-here"
            // Optional: custom theme — omit any key to keep the default
            // theme={{
            //   headerBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            //   activeTabColor: '#3b82f6',
            //   tableBackground: '#ffffff',
            //   buttonBackground: '#3b82f6',
            // }}
          />
        </section>
      </main>

      <footer className="footer">
        <p>Powered by Tropheo Widgets</p>
      </footer>
    </div>
  );
}
