import React, { useEffect, useState, useCallback } from 'react';
import type { ApiClient } from '@tropheo/core';
import type {
  LeaderboardEntry,
  LeaderboardMode,
  ScopeType,
  Sport,
  Facet,
  SortKey,
  SortDir,
} from '@tropheo/types';

/**
 * Translations for leaderboard
 */
const translations = {
  en: {
    loadingLeaderboard: 'Loading leaderboard...',
    error: 'Error',
    noStats: 'No stats available yet.',
    poweredBy: 'Powered by',
    viewOn: 'View on Tropheo',
  },
  es: {
    loadingLeaderboard: 'Cargando tabla de líderes...',
    error: 'Error',
    noStats: 'No hay estadísticas disponibles aún.',
    poweredBy: 'Desarrollado por',
    viewOn: 'Ver en Tropheo',
  },
};

type Language = 'en' | 'es';

interface LeaderboardTableProps {
  client: ApiClient;
  eventId: string;
  scopeType: ScopeType;
  sport: Sport;
  facet: Facet;
  mode?: LeaderboardMode;
  sort?: SortKey;
  limit?: number;
  title?: string;
  showEmptyState?: boolean;
  refreshTrigger?: number;
  className?: string;
  eventUrl?: string;
  baseUrl?: string;
  lang?: 'en' | 'es';
}

// Stat labels and formatting helpers
const getStatLabel = (key: string): string => {
  const labels: Record<string, string> = {
    // Basketball
    pts: 'PTS',
    reb: 'REB',
    ast: 'AST',
    stl: 'STL',
    blk: 'BLK',
    fg3: '3PM',
    fg2: '2PM',
    ft: 'FTM',
    to: 'TO',
    // Baseball batting
    avg: 'AVG',
    ops: 'OPS',
    obp: 'OBP',
    slg: 'SLG',
    h: 'H',
    doubles: '2B',
    triples: '3B',
    hr: 'HR',
    rbi: 'RBI',
    bb: 'BB',
    so: 'SO',
    sb: 'SB',
    tb: 'TB',
    ab: 'AB',
    r: 'R',
    // Baseball pitching
    era: 'ERA',
    whip: 'WHIP',
    ip: 'IP',
    outs: 'OUTS',
    er: 'ER',
    w: 'W',
    l: 'L',
    sv: 'SV',
    // Baseball fielding (a = assists, po = putouts)
    tc: 'TC',
    po: 'PO',
    e: 'E',
    dp: 'DP',
    tp: 'TP',
    fpct: 'FPCT',
    // Soccer (g = goals, a handled conditionally below)
    sh: 'SH',
    sot: 'SOT',
    yc: 'YC',
    rc: 'RC',
    bc: 'BC',
    min: 'MIN',
    fc: 'FC',
    fs: 'FS',
    off: 'OFF',
    shotAcc: 'SH%',
    // Goalkeeping
    ga: 'GA',
    savePct: 'SV%',
    gamesPlayed: 'GP',
  };

  // Handle context-dependent labels
  if (key === 'a') return 'A'; // Assists (fielding) or Assists (soccer)
  if (key === 'g') return 'G'; // Goals (soccer)

  return labels[key] || key.toUpperCase();
};

const getStatValue = (entry: LeaderboardEntry, key: string): string => {
  const totals = entry.totals;
  const derived = entry.derived;

  // Check derived stats first
  if (key in derived) {
    const val = (derived as any)[key];
    if (val === null || val === undefined) return '—';

    // Format percentages with 3 decimals
    if (key === 'avg' || key === 'obp' || key === 'slg' || key === 'fpct' || key === 'savePct') {
      return val.toFixed(3);
    }
    // Format rates with 2 decimals
    if (key === 'era' || key === 'whip' || key === 'ops' || key === 'shotAcc') {
      return val.toFixed(2);
    }
    return String(val);
  }

  // Check totals
  if (key in totals) {
    const val = (totals as any)[key];
    return val !== undefined && val !== null ? String(val) : '0';
  }

  // Special case for gamesPlayed
  if (key === 'gamesPlayed') {
    return String(entry.gamesPlayed || 0);
  }

  return '—';
};

// Get columns for each facet
const getColumnsForFacet = (facet: Facet): string[] => {
  switch (facet) {
    case 'basketball':
      return ['pts', 'reb', 'ast', 'stl', 'blk', 'fg3', 'to'];
    case 'batting':
      return ['avg', 'h', 'hr', 'rbi', 'bb', 'so', 'ops'];
    case 'pitching':
      return ['era', 'ip', 'so', 'bb', 'whip', 'w', 'l'];
    case 'fielding':
      return ['tc', 'po', 'a', 'e', 'fpct', 'dp'];
    case 'soccer':
      return ['g', 'a', 'sh', 'sot', 'shotAcc', 'yc', 'rc'];
    case 'goalkeeping':
      return ['sv', 'ga', 'savePct', 'min'];
    default:
      return [];
  }
};

// Get default sort for each facet
const getDefaultSort = (facet: Facet): SortKey => {
  switch (facet) {
    case 'basketball':
      return 'pts';
    case 'batting':
      return 'h';
    case 'pitching':
      return 'outs';
    case 'fielding':
      return 'tc';
    case 'soccer':
      return 'g';
    case 'goalkeeping':
      return 'sv';
    default:
      return 'gamesPlayed';
  }
};

/**
 * LeaderboardTable Component
 * Displays athlete or team stats leaderboard
 */
export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  client,
  eventId,
  scopeType,
  sport,
  facet,
  mode = 'athletes',
  sort: initialSort,
  limit = 50,
  title = 'Leaderboard',
  showEmptyState = false,
  refreshTrigger,
  className = '',
  eventUrl,
  baseUrl = 'https://app.tropheo.mx',
  lang = 'en',
}) => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(initialSort || getDefaultSort(facet));
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [eventName, setEventName] = useState<string>('');

  const t = translations[lang as Language];
  const columns = getColumnsForFacet(facet);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await client.getLeaderboard(
        eventId,
        scopeType,
        sport,
        facet,
        mode,
        sortKey,
        limit
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load leaderboard');
      }

      const { event, data: leaderboardData } = response.data;
      setEventName(event.name);

      // Sort data based on sortDir
      const sorted = [...leaderboardData].sort((a, b) => {
        const aVal = getStatValue(a, sortKey);
        const bVal = getStatValue(b, sortKey);

        // Handle numeric comparison
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDir === 'desc' ? bNum - aNum : aNum - bNum;
        }

        // String comparison fallback
        return sortDir === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      });

      setData(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [client, eventId, scopeType, sport, facet, mode, sortKey, sortDir, limit]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard, refreshTrigger]);

  const handleSort = (key: string) => {
    if (key === sortKey) {
      setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key as SortKey);
      setSortDir('desc');
    }
  };

  const getName = (entry: LeaderboardEntry): string => {
    if (mode === 'athletes') {
      return entry.athlete?.name || '—';
    }
    return entry.roster?.name || entry.organization?.name || '—';
  };

  const getAvatar = (entry: LeaderboardEntry): string | undefined => {
    if (mode === 'athletes') {
      return entry.athlete?.profilePicture;
    }
    return entry.organization?.profilePicture;
  };

  if (loading) {
    return (
      <div className={className} style={{ padding: '20px', textAlign: 'center' }}>
        {t.loadingLeaderboard}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={{ padding: '20px', color: '#ef4444' }}>
        {t.error}: {error}
      </div>
    );
  }

  if (!data.length) {
    if (showEmptyState) {
      return (
        <div
          className={className}
          style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}
        >
          {t.noStats}
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={className}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            margin: 0,
            color: '#ffffff',
          }}
        >
          {title}
        </h3>
        {eventName && (
          <p
            style={{
              fontSize: '12px',
              margin: '4px 0 0 0',
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            {eventName} · {mode === 'athletes' ? 'Athletes' : 'Teams'} · {getStatLabel(facet)}
          </p>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', padding: '16px 24px' }}>
        <table
          style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '14px' }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: '12px 12px 12px 0', fontWeight: 600 }}>#</th>
              <th
                style={{ textAlign: 'left', padding: '12px', fontWeight: 600, minWidth: '200px' }}
              >
                {mode === 'athletes' ? 'Athlete' : 'Team'}
              </th>
              <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>GP</th>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    textAlign: 'right',
                    padding: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => handleSort(col)}
                >
                  {getStatLabel(col)}
                  {sortKey === col && (
                    <span style={{ marginLeft: '4px' }}>{sortDir === 'desc' ? '↓' : '↑'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((entry, idx) => {
              const name = getName(entry);
              const avatarUrl = getAvatar(entry);
              const initials = name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <tr
                  key={entry.athleteId || entry.rosterId || entry.organizationId || `entry-${idx}`}
                  style={{
                    borderBottom: idx < data.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                >
                  <td style={{ padding: '12px 12px 12px 0', color: '#6b7280', fontWeight: 500 }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={name}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#6b7280',
                          }}
                        >
                          {initials}
                        </div>
                      )}
                      <span style={{ fontWeight: 500 }}>{name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{entry.gamesPlayed || 0}</td>
                  {columns.map((col) => (
                    <td key={col} style={{ padding: '12px', textAlign: 'right', fontWeight: 500 }}>
                      {getStatValue(entry, col)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#6b7280' }}>
            {t.poweredBy} <span style={{ fontWeight: 600, color: '#374151' }}>Tropheo</span>
          </span>
        </div>

        <a
          href={eventUrl || `${baseUrl}/events/${eventId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#ffffff',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '6px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }}
        >
          {t.viewOn}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M7 17L17 7M17 7H7M17 7V17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};
