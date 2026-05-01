import React, { useEffect, useState, useCallback } from 'react';
import type { ApiClient } from '@tropheo/core';
import type { StandingRow, EventRole, StageStandingsData, StandingsTheme } from '@tropheo/types';

/**
 * Translations for standings table
 */
const translations = {
  en: {
    loadingStandings: 'Loading standings...',
    error: 'Error',
    noStandings: 'No standings available yet.',
    poweredBy: 'Powered by',
    viewOn: 'View on Tropheo',
    team: 'Team',
    divisionStandings: 'Division Standings',
    gp: 'GP',
    w: 'W',
    l: 'L',
    t: 'T',
    gb: 'GB',
    pts: 'PTS',
    winPct: 'WIN%',
    pf: 'PF',
    pa: 'PA',
    diff: 'DIFF',
  },
  es: {
    loadingStandings: 'Cargando posiciones...',
    error: 'Error',
    noStandings: 'No hay posiciones disponibles aún.',
    poweredBy: 'Desarrollado por',
    viewOn: 'Ver en Tropheo',
    team: 'Equipo',
    divisionStandings: 'Posiciones de División',
    gp: 'PJ',
    w: 'G',
    l: 'P',
    t: 'E',
    gb: 'JD',
    pts: 'PTS',
    winPct: '% VIC',
    pf: 'PF',
    pa: 'PC',
    diff: 'DIF',
  },
};

type Language = 'en' | 'es';

interface StandingsTableProps {
  client: ApiClient;
  eventId: string;
  eventRole?: EventRole;
  title?: string;
  showEmptyState?: boolean;
  isAdmin?: boolean;
  refreshTrigger?: number;
  className?: string;
  eventUrl?: string;
  baseUrl?: string;
  lang?: 'en' | 'es';
  /** Visual theme overrides for the standings widget. */
  theme?: StandingsTheme;
}

const computeGamesBehind = (standings: StandingRow[]): Map<number, number | null> => {
  const result = new Map<number, number | null>();
  if (!standings?.length) return result;

  const leader = standings[0];
  const leaderW = leader.wins ?? 0;
  const leaderL = leader.losses ?? 0;

  standings.forEach((row, idx) => {
    const w = row.wins ?? 0;
    const l = row.losses ?? 0;
    const gb = (leaderW - w + l - leaderL) / 2;
    result.set(idx, gb <= 0 ? null : Math.round(gb * 10) / 10);
  });

  return result;
};

const shortenName = (name?: string | null): string => {
  if (!name || typeof name !== 'string') return '';
  const firstPart = name.split(' - ')[0]?.trim();
  return firstPart || name.trim();
};

const getRosterDisplayName = (row: StandingRow): string => {
  if (row.participantName) return shortenName(row.participantName) || row.participantName.trim();
  if (row.roster && typeof row.roster === 'object') {
    const name = (row.roster.title || row.roster.name || '').trim();
    if (name) return shortenName(name) || name;
  }
  return shortenName(row.participantName) || (typeof row.roster === 'string' ? row.roster : 'Team');
};

const isDivisionOrRoot = (r?: EventRole) =>
  r === 'DIVISION' || r === 'TOURNAMENT_ROOT' || r === 'SEASON' || r === 'LEAGUE';

/**
 * StandingsTable Component
 * Displays event standings with support for stages/divisions
 */
export const StandingsTable: React.FC<StandingsTableProps> = ({
  client,
  eventId,
  eventRole,
  title = 'Standings',
  showEmptyState = false,
  isAdmin: _isAdmin = false, // For future use
  refreshTrigger,
  className = '',
  eventUrl,
  baseUrl = 'https://www.tropheo.com',
  lang = 'en',
  theme = {},
}) => {
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [stageStandings, setStageStandings] = useState<Record<string, StageStandingsData>>({});
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  const t = translations[lang as Language];
  const isMobileMode = isDivisionOrRoot(eventRole);

  // ── Resolved theme (defaults merged with overrides) ──────────────────────
  const th = {
    tableBackground: theme.tableBackground ?? '#ffffff',
    columnHeaderColor: theme.columnHeaderColor ?? '#374151',
    rowTextColor: theme.rowTextColor ?? '#374151',
    rowBorderColor: theme.rowBorderColor ?? '#f3f4f6',
    borderColor: theme.borderColor ?? '#e5e7eb',
    footerBackground: theme.footerBackground ?? '#f9fafb',
    buttonBackground: theme.buttonBackground ?? '#3b82f6',
    buttonTextColor: theme.buttonTextColor ?? '#ffffff',
    positiveColor: theme.positiveColor ?? '#10b981',
    negativeColor: theme.negativeColor ?? '#ef4444',
  };

  const loadStandings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isMobileMode) {
        // Load direct sub-events
        const subEventsRes = await client.getSubEvents(eventId);
        const subEventsData = subEventsRes.success && subEventsRes.data ? subEventsRes.data : [];
        const regularSubEvents = subEventsData.filter((e: any) => !e.isCategory);

        let stageEvents = regularSubEvents.filter((e: any) =>
          ['POOL', 'BRACKET_STAGE'].includes(e.eventRole || '')
        );

        // For root-like roles, pools may be nested under division children
        if (
          (eventRole === 'TOURNAMENT_ROOT' || eventRole === 'SEASON' || eventRole === 'LEAGUE') &&
          stageEvents.length === 0
        ) {
          const divisions = regularSubEvents.filter((e: any) => e.eventRole === 'DIVISION');
          const divisionChildren = await Promise.all(
            divisions.map(async (div: any) => {
              const divId = div.id || div._id;
              if (!divId) return [];
              const res = await client.getSubEvents(divId);
              return res.success && res.data ? res.data : [];
            })
          );
          stageEvents = divisionChildren
            .flat()
            .filter(
              (e: any) => !e.isCategory && ['POOL', 'BRACKET_STAGE'].includes(e.eventRole || '')
            );
        }

        setStages(stageEvents);

        // Load standings for each stage in parallel
        const stageStandingsEntries = await Promise.all(
          stageEvents.map(async (stage: any) => {
            const stageId = stage.id || stage._id;
            if (!stageId) return null;
            const scope = stage.eventRole === 'POOL' ? 'POOL' : 'BRACKET';
            const res = await client.getStandings(stageId, scope);
            if (res.success && res.data) {
              return [stageId, { stage, rows: res.data.standings || res.data }] as [
                string,
                StageStandingsData,
              ];
            }
            return null;
          })
        );

        const stageStandingsData: Record<string, StageStandingsData> = {};
        for (const entry of stageStandingsEntries) {
          if (entry) stageStandingsData[entry[0]] = entry[1];
        }
        setStageStandings(stageStandingsData);

        // Load division + overall standings in parallel
        const [divRes, overallRes] = await Promise.all([
          client.getStandings(eventId, 'DIVISION'),
          client.getStandings(eventId, 'OVERALL'),
        ]);

        const divRows = divRes.success && divRes.data ? divRes.data.standings || divRes.data : [];
        const overallRows =
          overallRes.success && overallRes.data ? overallRes.data.standings || overallRes.data : [];

        let summaryRows = divRows.length > 0 ? divRows : overallRows;

        // Fallback: if both DIVISION and OVERALL return empty AND no stages were found,
        // call without scope so the backend auto-expands SEASON/LEAGUE to child POOL standings.
        if (summaryRows.length === 0 && Object.keys(stageStandingsData).length === 0) {
          const fallbackRes = await client.getStandings(eventId);
          if (fallbackRes.success && fallbackRes.data) {
            summaryRows = fallbackRes.data.standings || fallbackRes.data || [];
          }
        }

        setStandings(summaryRows);
      } else {
        // Single event mode - no need for scope, API will determine it from event
        const res = await client.getStandings(eventId);

        if (res.success && res.data) {
          // Handle new response format with event and standings
          const standingsData = res.data.standings || res.data;
          setStandings(standingsData);
        } else {
          setError(res.error || 'Failed to load standings');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [client, eventId, eventRole, isMobileMode]);

  useEffect(() => {
    if (eventId) {
      loadStandings();
    }
  }, [eventId, refreshTrigger, loadStandings]);

  const renderTable = (rows: StandingRow[], startRank: number = 1) => {
    const gbMap = computeGamesBehind(rows);

    return (
      <table className="min-w-full text-xs sm:text-sm" style={{ width: '100%' }}>
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
                minWidth: '160px',
                color: th.columnHeaderColor,
              }}
            >
              {t.team}
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '12px',
                fontWeight: 600,
                color: th.columnHeaderColor,
              }}
            >
              {t.gp}
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '12px',
                fontWeight: 600,
                color: th.columnHeaderColor,
              }}
            >
              {t.w}
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '12px',
                fontWeight: 600,
                color: th.columnHeaderColor,
              }}
            >
              {t.l}
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '12px',
                fontWeight: 600,
                color: th.columnHeaderColor,
              }}
            >
              {t.t}
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '12px',
                fontWeight: 600,
                color: th.columnHeaderColor,
              }}
            >
              {t.gb}
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '12px',
                fontWeight: 600,
                color: th.columnHeaderColor,
              }}
            >
              {t.pts}
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '12px',
                fontWeight: 600,
                color: th.columnHeaderColor,
              }}
            >
              {t.winPct}
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '12px',
                fontWeight: 600,
                color: th.columnHeaderColor,
              }}
            >
              {t.pf}
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '12px',
                fontWeight: 600,
                color: th.columnHeaderColor,
              }}
            >
              {t.pa}
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '12px 0 12px 12px',
                fontWeight: 600,
                color: th.columnHeaderColor,
              }}
            >
              {t.diff}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const rosterName = getRosterDisplayName(row);
            const avatarUrl =
              row.organization?.profilePicture || row.organization?.profileThumbnail;
            const initials = rosterName
              .split(' ')
              .map((w) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
            const gb = gbMap.get(idx);
            const winPct = row.winPercentage ?? 0;

            return (
              <tr
                key={row.id || idx}
                style={{
                  borderBottom: idx < rows.length - 1 ? `1px solid ${th.rowBorderColor}` : 'none',
                }}
              >
                <td
                  style={{
                    padding: '12px 12px 12px 0',
                    color: '#6b7280',
                    fontWeight: 500,
                    fontSize: 'inherit',
                  }}
                >
                  {startRank + idx}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={rosterName}
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
                    <span style={{ fontWeight: 500, color: th.rowTextColor }}>{rosterName}</span>
                  </div>
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: th.rowTextColor }}>
                  {row.gamesPlayed ?? 0}
                </td>
                <td
                  style={{
                    padding: '12px',
                    textAlign: 'right',
                    fontWeight: 600,
                    color: th.rowTextColor,
                  }}
                >
                  {row.wins ?? 0}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: th.rowTextColor }}>
                  {row.losses ?? 0}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: th.rowTextColor }}>
                  {row.ties ?? 0}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>
                  {gb !== null && gb !== undefined ? gb.toFixed(1) : '—'}
                </td>
                <td
                  style={{
                    padding: '12px',
                    textAlign: 'right',
                    fontWeight: 600,
                    color: th.rowTextColor,
                  }}
                >
                  {row.points ?? 0}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>
                  {winPct.toFixed(3)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: th.rowTextColor }}>
                  {row.pointsFor ?? 0}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: th.rowTextColor }}>
                  {row.pointsAgainst ?? 0}
                </td>
                <td
                  style={{
                    padding: '12px 0 12px 12px',
                    textAlign: 'right',
                    color: (row.pointDifferential ?? 0) >= 0 ? th.positiveColor : th.negativeColor,
                  }}
                >
                  {(row.pointDifferential ?? 0) >= 0 ? '+' : ''}
                  {row.pointDifferential ?? 0}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const renderGroupedTables = (rows: StandingRow[]) => {
    // Group standings by groupLabel
    const byGroup = new Map<string, StandingRow[]>();

    for (const row of rows) {
      const label = ((row as any).groupLabel || '').trim() || '\0';
      if (!byGroup.has(label)) {
        byGroup.set(label, []);
      }
      byGroup.get(label)!.push(row);
    }

    const groups = Array.from(byGroup.entries()).map(([label, groupRows]) => ({
      groupLabel: label === '\0' ? null : label,
      rows: groupRows,
    }));

    // Calculate starting rank for each group
    let cumulativeRank = 1;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {groups.map(({ groupLabel, rows: groupRows }, groupIdx) => {
          const startRank = cumulativeRank;
          cumulativeRank += groupRows.length;

          return (
            <div key={groupLabel ?? `group-${groupIdx}`}>
              {groupLabel && (
                <h4
                  style={{
                    fontWeight: 600,
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: '#6b7280',
                  }}
                >
                  {groupLabel}
                </h4>
              )}
              <div style={{ overflowX: 'auto' }}>{renderTable(groupRows, startRank)}</div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={className} style={{ padding: '20px', textAlign: 'center' }}>
        <p>{t.loadingStandings}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
        <p>
          {t.error}: {error}
        </p>
      </div>
    );
  }

  const hasStandings = standings.length > 0 || Object.keys(stageStandings).length > 0;

  if (!hasStandings && !showEmptyState) {
    return null;
  }

  const finalEventUrl = eventUrl || `${baseUrl}/events/${eventId}`;

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
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${th.borderColor}` }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: th.rowTextColor }}>
          {title}
        </h3>
      </div>
      <div style={{ padding: '16px 24px', overflowX: 'auto' }}>
        {hasStandings ? (
          <div>
            {isMobileMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {stages.map((stage) => {
                  const stageId = stage.id || stage._id;
                  const entry = stageStandings[stageId];
                  if (!entry || !entry.rows.length) return null;

                  const isExpanded = expandedStages.has(stageId);
                  const stageName = stage.name || stage.eventRole || 'Stage';

                  return (
                    <div key={stageId}>
                      <button
                        onClick={() => {
                          setExpandedStages((prev) => {
                            const next = new Set(prev);
                            if (next.has(stageId)) {
                              next.delete(stageId);
                            } else {
                              next.add(stageId);
                            }
                            return next;
                          });
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          border: `1px solid ${th.borderColor}`,
                          borderRadius: '8px',
                          backgroundColor: th.footerBackground,
                          cursor: 'pointer',
                          fontWeight: 500,
                          color: th.rowTextColor,
                          marginBottom: '8px',
                        }}
                      >
                        {stageName}
                        <span>{isExpanded ? '▲' : '▼'}</span>
                      </button>
                      {isExpanded && (
                        <div style={{ overflowX: 'auto' }}>{renderGroupedTables(entry.rows)}</div>
                      )}
                    </div>
                  );
                })}
                {standings.length > 0 && (
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '12px' }}>{t.divisionStandings}</h4>
                    {renderGroupedTables(standings)}
                  </div>
                )}
              </div>
            ) : (
              renderGroupedTables(standings)
            )}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>{t.noStandings}</p>
        )}
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
        {/* Powered by Tropheo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#6b7280' }}>
            {t.poweredBy} <span style={{ fontWeight: 600, color: th.rowTextColor }}>Tropheo</span>
          </span>
        </div>

        {/* Ver en Tropheo button */}
        <a
          href={finalEventUrl}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.85';
          }}
          onMouseLeave={(e) => {
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

export default StandingsTable;
