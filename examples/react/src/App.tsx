import { useState } from 'react';
import { TropheoWidgets, StandingsTable, LeaderboardTable } from '@tropheo/react';
import './App.css';

// ─── CONFIGURE YOUR VALUES HERE ──────────────────────────────
const API_KEY = 'your-api-key-here';
const BASE_URL = 'https://your-tropheo-instance.com';
const EVENT_ID = 'your-event-id-here';
// ─────────────────────────────────────────────────────────────

function App() {
  const [widgets] = useState(() => {
    return new TropheoWidgets({
      apiKey: API_KEY,
      baseUrl: BASE_URL,
    });
  });

  return (
    <div className="App">
      <header>
        <h1>Tropheo Widgets — React Example</h1>
        <p className="description">
          Demonstrates <code>StandingsTable</code> and <code>LeaderboardTable</code> in a React app
          with Vite.
        </p>
      </header>

      <main>
        {/* Standings — auto-detects event role (POOL / DIVISION / TOURNAMENT_ROOT / SEASON / LEAGUE) */}
        <section>
          <StandingsTable
            client={widgets.getClient()}
            eventId={EVENT_ID}
            title="Tournament Standings"
            showEmptyState={true}
            lang="en"
            // Optional: custom theme — omit any key to keep the default
            // theme={{
            //   tableBackground: '#ffffff',
            //   columnHeaderColor: '#374151',
            //   rowTextColor: '#374151',
            //   rowBorderColor: '#f3f4f6',
            //   borderColor: '#e5e7eb',
            //   footerBackground: '#f9fafb',
            //   buttonBackground: '#3b82f6',
            //   buttonTextColor: '#ffffff',
            //   positiveColor: '#10b981',
            //   negativeColor: '#ef4444',
            // }}
          />
        </section>

        {/* Stats leaderboard — columns are clickable to sort */}
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
            //   headerTextColor: '#ffffff',
            //   activeTabColor: '#3b82f6',
            //   inactiveTabColor: '#6b7280',
            //   tableBackground: '#ffffff',
            //   columnHeaderColor: '#374151',
            //   rowTextColor: '#374151',
            //   rowBorderColor: '#f3f4f6',
            //   borderColor: '#e5e7eb',
            //   footerBackground: '#f9fafb',
            //   buttonBackground: '#3b82f6',
            //   buttonTextColor: '#ffffff',
            //   avatarBackground: '#e5e7eb',
            // }}
          />
        </section>
      </main>

      <footer>
        <p>Powered by Tropheo Widgets</p>
      </footer>
    </div>
  );
}

export default App;
