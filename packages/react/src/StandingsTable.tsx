import React, { useEffect, useState, useCallback } from 'react';
import type { ApiClient } from '@tropheo/core';
import type { StandingRow, EventRole } from '@tropheo/types';

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
}

interface StageStandingsData {
  stage: any;
  rows: StandingRow[];
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

const isDivisionOrRoot = (r?: EventRole) => r === 'DIVISION' || r === 'TOURNAMENT_ROOT';

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
  baseUrl = 'https://app.tropheo.mx',
  lang = 'en',
}) => {
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [stageStandings, setStageStandings] = useState<Record<string, StageStandingsData>>({});
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  const t = translations[lang as Language];
  const isMobileMode = isDivisionOrRoot(eventRole);

  const loadStandings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isMobileMode) {
        // Load stages first
        const subEventsRes = await client.getSubEvents(eventId);
        if (subEventsRes.success && subEventsRes.data) {
          const stageEvents = subEventsRes.data.filter(
            (e: any) => !e.isCategory && ['POOL', 'BRACKET_STAGE'].includes(e.eventRole || '')
          );

          setStages(stageEvents);

          // Load standings for each stage
          const stageStandingsData: Record<string, StageStandingsData> = {};
          for (const stage of stageEvents) {
            const stageId = stage.id || stage._id;
            if (!stageId) continue;

            const scope = stage.eventRole === 'POOL' ? 'POOL' : 'BRACKET';
            const res = await client.getStandings(stageId, scope);
            if (res.success && res.data) {
              stageStandingsData[stageId] = {
                stage,
                rows: res.data.standings || res.data, // Handle both old and new response format
              };
            }
          }
          setStageStandings(stageStandingsData);
        }

        // Load division/overall standings
        const divRes = await client.getStandings(eventId, 'DIVISION');
        const overallRes = await client.getStandings(eventId, 'OVERALL');

        const divRows = divRes.success && divRes.data ? divRes.data.standings || divRes.data : [];
        const overallRows =
          overallRes.success && overallRes.data ? overallRes.data.standings || overallRes.data : [];

        setStandings(divRows.length > 0 ? divRows : overallRows);
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
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: '12px 12px 12px 0', fontWeight: 600 }}>#</th>
            <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, minWidth: '160px' }}>
              {t.team}
            </th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>{t.gp}</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>{t.w}</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>{t.l}</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>{t.t}</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>{t.gb}</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>{t.pts}</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>{t.winPct}</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>{t.pf}</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>{t.pa}</th>
            <th style={{ textAlign: 'right', padding: '12px 0 12px 12px', fontWeight: 600 }}>
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
                  borderBottom: idx < rows.length - 1 ? '1px solid #f3f4f6' : 'none',
                }}
              >
                <td style={{ padding: '12px 12px 12px 0', color: '#6b7280', fontWeight: 500 }}>
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
                    <span style={{ fontWeight: 500 }}>{rosterName}</span>
                  </div>
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{row.gamesPlayed ?? 0}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                  {row.wins ?? 0}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{row.losses ?? 0}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{row.ties ?? 0}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>
                  {gb !== null && gb !== undefined ? gb.toFixed(1) : '—'}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                  {row.points ?? 0}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>
                  {winPct.toFixed(3)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{row.pointsFor ?? 0}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{row.pointsAgainst ?? 0}</td>
                <td
                  style={{
                    padding: '12px 0 12px 12px',
                    textAlign: 'right',
                    color: (row.pointDifferential ?? 0) >= 0 ? '#10b981' : '#ef4444',
                  }}
                >
                  {(row.pointDifferential ?? 0 >= 0) ? '+' : ''}
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
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{title}</h3>
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
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          backgroundColor: '#f9fafb',
                          cursor: 'pointer',
                          fontWeight: 500,
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
                    <h4 style={{ fontWeight: 600, marginBottom: '12px' }}>Division Standings</h4>
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
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
        }}
      >
        {/* Powered by Tropheo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#6b7280' }}>
            {t.poweredBy} <span style={{ fontWeight: 600, color: '#374151' }}>Tropheo</span>
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
            color: '#ffffff',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '6px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
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

export default StandingsTable;
