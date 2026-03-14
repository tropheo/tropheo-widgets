import React, { useEffect, useState, useCallback } from 'react';
import type { ApiClient } from '@tropheo/core';
import type { StandingRow, EventRole } from '@tropheo/types';

interface StandingsTableProps {
  client: ApiClient;
  eventId: string;
  eventRole?: EventRole;
  title?: string;
  showEmptyState?: boolean;
  isAdmin?: boolean;
  refreshTrigger?: number;
  className?: string;
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
}) => {
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [stageStandings, setStageStandings] = useState<Record<string, StageStandingsData>>({});
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

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

  const renderTable = (rows: StandingRow[]) => {
    const gbMap = computeGamesBehind(rows);

    return (
      <table className="min-w-full text-xs sm:text-sm" style={{ width: '100%' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: '12px 12px 12px 0', fontWeight: 600 }}>#</th>
            <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, minWidth: '160px' }}>
              Team
            </th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>GP</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>W</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>L</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>T</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>GB</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>PTS</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>WIN%</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>PF</th>
            <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>PA</th>
            <th style={{ textAlign: 'right', padding: '12px 0 12px 12px', fontWeight: 600 }}>
              DIFF
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
                  {idx + 1}
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

  if (loading) {
    return (
      <div className={className} style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading standings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  const hasStandings = standings.length > 0 || Object.keys(stageStandings).length > 0;

  if (!hasStandings && !showEmptyState) {
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
                        <div style={{ overflowX: 'auto' }}>{renderTable(entry.rows)}</div>
                      )}
                    </div>
                  );
                })}
                {standings.length > 0 && (
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '12px' }}>Division Standings</h4>
                    {renderTable(standings)}
                  </div>
                )}
              </div>
            ) : (
              renderTable(standings)
            )}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No standings available yet.</p>
        )}
      </div>
    </div>
  );
};

export default StandingsTable;
