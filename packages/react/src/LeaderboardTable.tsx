import React, { useEffect, useState } from 'react';
import type { ApiClient } from '@tropheo/core';
import type {
  LeaderboardEntry,
  LeaderboardMode,
  ScopeType,
  Sport,
  Facet,
  SortKey,
  SortDir,
  EventRole,
  LeaderboardTheme,
} from '@tropheo/types';

/**
 * Translations for leaderboard
 */
const translations = {
  en: {
    loadingLeaderboard: 'Loading leaderboard...',
    error: 'Error',
    noStats: 'No stats available yet.',
    statsDisabled: 'Stats are not enabled for this event.',
    athlete: 'Athlete',
    team: 'Team',
    poweredBy: 'Powered by',
    viewOn: 'View on Tropheo',
    athletes: 'Athletes',
    teams: 'Teams',
    batting: 'Batting',
    pitching: 'Pitching',
    fielding: 'Fielding',
    soccerFacet: 'Soccer',
    goalkeeping: 'Goalkeeping',
  },
  es: {
    loadingLeaderboard: 'Cargando tabla de líderes...',
    error: 'Error',
    noStats: 'No hay estadísticas disponibles aún.',
    statsDisabled: 'Las estadísticas no están habilitadas para este evento.',
    athlete: 'Atleta',
    team: 'Equipo',
    poweredBy: 'Desarrollado por',
    viewOn: 'Ver en Tropheo',
    athletes: 'Atletas',
    teams: 'Equipos',
    batting: 'Bateo',
    pitching: 'Pitcheo',
    fielding: 'Fildeo',
    soccerFacet: 'Fútbol',
    goalkeeping: 'Porteros',
  },
};

type Language = 'en' | 'es';
type Translations = (typeof translations)['en'];

// ─── Auto-detection helpers ──────────────────────────────────────────────────

const mapEventRoleToScopeType = (role: EventRole | string | null | undefined): ScopeType => {
  switch (role) {
    case 'POOL':
    case 'BRACKET_STAGE':
      return 'STAGE';
    case 'DIVISION':
      return 'DIVISION';
    case 'GAMEDAY':
      return 'GAMEDAY';
    default:
      return 'TOURNAMENT';
  }
};

const mapSportToDefaultFacet = (sport: Sport): Facet => {
  switch (sport) {
    case 'basketball':
      return 'basketball';
    case 'baseball':
    case 'softball':
      return 'batting';
    case 'soccer':
      return 'soccer';
    default:
      return 'basketball';
  }
};

const getFacetTabsForSport = (
  sport: Sport | null,
  t: Translations
): Array<{ key: Facet; label: string }> | null => {
  switch (sport) {
    case 'baseball':
    case 'softball':
      return [
        { key: 'batting', label: t.batting },
        { key: 'pitching', label: t.pitching },
        { key: 'fielding', label: t.fielding },
      ];
    case 'soccer':
      return [
        { key: 'soccer', label: t.soccerFacet },
        { key: 'goalkeeping', label: t.goalkeeping },
      ];
    default:
      return null;
  }
};

// ─── Props ───────────────────────────────────────────────────────────────────

type ResolvedConfig = {
  scopeType: ScopeType;
  sport: Sport;
  initialFacet: Facet;
};

interface LeaderboardTableProps {
  client: ApiClient;
  eventId: string;
  /** Auto-detected from event if not provided */
  scopeType?: ScopeType;
  /** Auto-detected from event if not provided */
  sport?: Sport;
  /** Auto-selected from sport if not provided */
  facet?: Facet;
  /** Defaults to 'athletes' */
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
  /**
   * Filter leaderboard to only show athletes from a specific organization.
   * Filtering is done client-side. When set, the Teams tab is hidden.
   */
  filterByOrganizationId?: string;
  /** Visual theme overrides. */
  theme?: LeaderboardTheme;
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
 * Displays athlete or team stats leaderboard.
 *
 * scopeType, sport, and facet are all optional — they are auto-detected from
 * the event if not provided. Interactive facet tabs (Batting/Pitching/Fielding
 * for baseball/softball; Soccer/Goalkeeping for soccer) and mode tabs
 * (Athletes / Teams) are rendered automatically.
 */
export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  client,
  eventId,
  scopeType: scopeTypeProp,
  sport: sportProp,
  facet: facetProp,
  mode: modeProp = 'athletes',
  sort: initialSort,
  limit = 50,
  title = 'Leaderboard',
  showEmptyState = false,
  refreshTrigger,
  className = '',
  eventUrl,
  baseUrl = 'https://www.tropheo.com',
  lang = 'en',
  filterByOrganizationId,
  theme = {},
}) => {
  // ── Resolved theme (defaults merged with overrides) ──────────────────────────
  const th = {
    headerBackground: theme.headerBackground ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    headerTextColor: theme.headerTextColor ?? '#ffffff',
    activeTabColor: theme.activeTabColor ?? '#3b82f6',
    inactiveTabColor: theme.inactiveTabColor ?? '#6b7280',
    tableBackground: theme.tableBackground ?? '#ffffff',
    columnHeaderColor: theme.columnHeaderColor ?? '#374151',
    rowTextColor: theme.rowTextColor ?? '#374151',
    rowBorderColor: theme.rowBorderColor ?? '#f3f4f6',
    borderColor: theme.borderColor ?? '#e5e7eb',
    footerBackground: theme.footerBackground ?? '#f9fafb',
    buttonBackground: theme.buttonBackground ?? '#3b82f6',
    buttonTextColor: theme.buttonTextColor ?? '#ffffff',
    avatarBackground: theme.avatarBackground ?? '#e5e7eb',
  };
  // Resolved config — set once from props or API fetch, then cached
  const [resolvedConfig, setResolvedConfig] = useState<ResolvedConfig | null>(() => {
    if (scopeTypeProp && sportProp) {
      return {
        scopeType: scopeTypeProp,
        sport: sportProp,
        initialFacet: facetProp || mapSportToDefaultFacet(sportProp),
      };
    }
    return null;
  });

  // Active UI state (driven by tab clicks; null = fall back to resolvedConfig.initialFacet)
  const [activeFacet, setActiveFacet] = useState<Facet | null>(facetProp || null);
  const [activeMode, setActiveMode] = useState<LeaderboardMode>(modeProp);

  // Data state
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(() => {
    if (initialSort) return initialSort;
    if (facetProp) return getDefaultSort(facetProp);
    if (sportProp) return getDefaultSort(mapSportToDefaultFacet(sportProp));
    return 'gamesPlayed';
  });
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [eventName, setEventName] = useState<string>('');
  const [statsEnabled, setStatsEnabled] = useState<boolean>(true);

  const t = translations[lang as Language];

  // ── Effect 1: Resolve event config (scopeType + sport) ──────────────────────
  useEffect(() => {
    let cancelled = false;

    if (scopeTypeProp && sportProp) {
      const defaultFacet = facetProp || mapSportToDefaultFacet(sportProp);
      setResolvedConfig({ scopeType: scopeTypeProp, sport: sportProp, initialFacet: defaultFacet });
      setActiveFacet(facetProp || null);
      if (!initialSort) setSortKey(getDefaultSort(facetProp || defaultFacet));
      return;
    }

    const fetchConfig = async () => {
      try {
        const res = await client.getStandings(eventId);
        if (cancelled) return;

        if (res.success && res.data?.event) {
          const event = res.data.event;
          const sport =
            (sportProp as Sport | undefined) || (event.sport as Sport | undefined) || 'basketball';
          const scopeType = scopeTypeProp || mapEventRoleToScopeType(event.eventRole);
          const defaultFacet = facetProp || mapSportToDefaultFacet(sport);

          setResolvedConfig({ scopeType, sport, initialFacet: defaultFacet });
          setActiveFacet(facetProp || null);
          if (!initialSort) setSortKey(getDefaultSort(facetProp || defaultFacet));
        }
      } catch {
        // Silently ignore; Effect 2 will surface any error
      }
    };

    fetchConfig();
    return () => {
      cancelled = true;
    };
  }, [eventId, scopeTypeProp, sportProp, facetProp]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 2: Fetch leaderboard data ────────────────────────────────────────
  useEffect(() => {
    if (!resolvedConfig) return;

    let cancelled = false;
    const effectiveFacet = activeFacet ?? resolvedConfig.initialFacet;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await client.getLeaderboard(
          eventId,
          resolvedConfig.scopeType,
          resolvedConfig.sport,
          effectiveFacet,
          activeMode,
          sortKey,
          limit
        );

        if (cancelled) return;

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to load leaderboard');
        }

        const { event, data: leaderboardData, statsEnabled: enabled } = response.data;
        setEventName(event.name);
        setStatsEnabled(enabled ?? true);

        // Client-side filter by organization when filterByOrganizationId is set
        const filtered = filterByOrganizationId
          ? leaderboardData.filter((e) => e.organizationId === filterByOrganizationId)
          : leaderboardData;

        const sorted = [...filtered].sort((a, b) => {
          const aVal = getStatValue(a, sortKey);
          const bVal = getStatValue(b, sortKey);
          const aNum = parseFloat(aVal);
          const bNum = parseFloat(bVal);
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return sortDir === 'desc' ? bNum - aNum : aNum - bNum;
          }
          return sortDir === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
        });

        setData(sorted);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [
    client,
    eventId,
    resolvedConfig,
    activeFacet,
    activeMode,
    sortKey,
    sortDir,
    limit,
    refreshTrigger,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleFacetChange = (newFacet: Facet) => {
    setActiveFacet(newFacet);
    setSortKey(getDefaultSort(newFacet));
    setSortDir('desc');
  };

  const handleModeChange = (newMode: LeaderboardMode) => {
    setActiveMode(newMode);
  };

  const handleSort = (key: string) => {
    if (key === sortKey) {
      setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key as SortKey);
      setSortDir('desc');
    }
  };

  const getName = (entry: LeaderboardEntry): string => {
    if (activeMode === 'athletes') return entry.athlete?.name || '—';
    return entry.roster?.name || entry.organization?.name || '—';
  };

  const getAvatar = (entry: LeaderboardEntry): string | undefined => {
    if (activeMode === 'athletes') return entry.athlete?.profilePicture;
    return entry.organization?.profilePicture;
  };

  // ── Computed display values ──────────────────────────────────────────────────

  const effectiveFacet = activeFacet ?? resolvedConfig?.initialFacet;
  const columns = effectiveFacet ? getColumnsForFacet(effectiveFacet) : [];
  const facetTabs = resolvedConfig ? getFacetTabsForSport(resolvedConfig.sport, t) : null;
  const currentFacetKey = activeFacet ?? resolvedConfig?.initialFacet;

  // ── Render ────────────────────────────────────────────────────────────────────

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
          {!statsEnabled ? t.statsDisabled : t.noStats}
        </div>
      );
    }
    return null;
  }

  const tabBtnStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: isActive ? 600 : 500,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    borderBottom: isActive ? `2px solid ${th.activeTabColor}` : '2px solid transparent',
    color: isActive ? th.activeTabColor : th.inactiveTabColor,
    marginBottom: '-1px',
    transition: 'color 0.15s',
    outline: 'none',
  });

  return (
    <div
      className={className}
      style={{
        border: `1px solid ${th.borderColor}`,
        borderRadius: '8px',
        backgroundColor: th.tableBackground,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${th.borderColor}`,
          background: th.headerBackground,
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: th.headerTextColor }}>
          {title}
        </h3>
        {eventName && (
          <p
            style={{
              fontSize: '12px',
              margin: '4px 0 0 0',
              color: th.headerTextColor,
              opacity: 0.9,
            }}
          >
            {eventName} · {activeMode === 'athletes' ? t.athlete : t.team}
            {effectiveFacet ? ` · ${getStatLabel(effectiveFacet)}` : ''}
          </p>
        )}
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderBottom: `1px solid ${th.borderColor}`,
        }}
      >
        {/* Facet tabs — only for multi-facet sports (baseball/softball/soccer) */}
        {facetTabs && facetTabs.length > 1 && (
          <div
            style={{
              display: 'flex',
              padding: '0 24px',
              borderBottom: `1px solid ${th.rowBorderColor}`,
            }}
          >
            {facetTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleFacetChange(tab.key)}
                style={tabBtnStyle(currentFacetKey === tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Mode tabs — Teams tab hidden when filtering by organization */}
        <div style={{ display: 'flex', padding: '0 24px' }}>
          <button
            onClick={() => handleModeChange('athletes')}
            style={tabBtnStyle(activeMode === 'athletes')}
          >
            {t.athletes}
          </button>
          {!filterByOrganizationId && (
            <button
              onClick={() => handleModeChange('teams')}
              style={tabBtnStyle(activeMode === 'teams')}
            >
              {t.teams}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', padding: '16px 24px' }}>
        <table
          style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '14px' }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${th.borderColor}` }}>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px 12px 12px 0',
                  fontWeight: 600,
                  color: th.columnHeaderColor,
                }}
              >
                #
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  fontWeight: 600,
                  minWidth: '200px',
                  color: th.columnHeaderColor,
                }}
              >
                {activeMode === 'athletes' ? t.athlete : t.team}
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: '12px',
                  fontWeight: 600,
                  color: th.columnHeaderColor,
                }}
              >
                GP
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    textAlign: 'right',
                    padding: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    color: th.columnHeaderColor,
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
                    borderBottom: idx < data.length - 1 ? `1px solid ${th.rowBorderColor}` : 'none',
                  }}
                >
                  <td
                    style={{
                      padding: '12px 12px 12px 0',
                      color: th.inactiveTabColor,
                      fontWeight: 500,
                    }}
                  >
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
                            backgroundColor: th.avatarBackground,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: th.inactiveTabColor,
                          }}
                        >
                          {initials}
                        </div>
                      )}
                      <span style={{ fontWeight: 500, color: th.rowTextColor }}>{name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: th.rowTextColor }}>
                    {entry.gamesPlayed || 0}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col}
                      style={{
                        padding: '12px',
                        textAlign: 'right',
                        fontWeight: 500,
                        color: th.rowTextColor,
                      }}
                    >
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
          borderTop: `1px solid ${th.borderColor}`,
          backgroundColor: th.footerBackground,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: th.inactiveTabColor }}>
            {t.poweredBy} <span style={{ fontWeight: 600, color: th.rowTextColor }}>Tropheo</span>
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
            color: th.buttonTextColor,
            backgroundColor: th.buttonBackground,
            border: 'none',
            borderRadius: '6px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.opacity = '0.85';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.opacity = '1';
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
