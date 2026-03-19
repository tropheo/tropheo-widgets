import { useState } from 'react';
import { TropheoWidgets, StandingsTable } from '@tropheo/react';
import './App.css';

function App() {
  // Configuration
  const API_KEY = 'your-api-key-here';
  const BASE_URL = 'https://your-tropheo-instance.com';
  const EVENT_ID = 'your-event-id-here';

  // Initialize Tropheo Widgets
  const [widgets] = useState(() => {
    return new TropheoWidgets({
      apiKey: API_KEY,
      baseUrl: BASE_URL,
    });
  });

  return (
    <div className="App">
      <header>
        <h1>Tropheo Widgets - React Example</h1>
        <p className="description">
          This example demonstrates how to embed Tropheo standings widget in a React application.
        </p>
      </header>

      <main>
        <StandingsTable
          client={widgets.getClient()}
          eventId={EVENT_ID}
          eventRole="DIVISION"
          title="Tournament Standings"
          showEmptyState={true}
          lang="en"
        />
      </main>

      <footer>
        <p>Powered by Tropheo Widgets</p>
      </footer>
    </div>
  );
}

export default App;
