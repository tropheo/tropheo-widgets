import React, { useEffect, useState, useMemo } from 'react';
import type { ApiClient } from '@tropheo/core';
import type { WidgetGame, WidgetStage, ScheduleTheme } from '@tropheo/types';

// ─── Translations ─────────────────────────────────────────────────────────────

const translations = {
  en: {
    loading: 'Loading schedule…',
    error: 'Error',
    noGames: 'No games in this event yet.',
    noGamesDay: 'No games scheduled for this day.',
    noGamesStage: 'No games in this stage.',
    live: 'LIVE',
    upcoming: 'Upcoming',
    completed: 'Completed',
    vs: 'vs',
    poweredBy: 'Powered by',
    viewOn: 'View on Tropheo',
    schedule: 'Schedule',
    calendarView: 'Calendar',
    listView: 'List',
    viewDetails: 'View details',
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    daysShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    directGames: 'Direct Games',
    games: 'Games',
    gamesOn: 'Games on',
    time: 'Time',
    venue: 'Venue',
    field: 'Field',
  },
  es: {
    loading: 'Cargando agenda…',
    error: 'Error',
    noGames: 'Aún no hay partidos en este evento.',
    noGamesDay: 'No hay partidos programados para este día.',
    noGamesStage: 'No hay partidos en esta etapa.',
    live: 'EN VIVO',
    upcoming: 'Próximo',
    completed: 'Finalizado',
    vs: 'vs',
    poweredBy: 'Desarrollado por',
    viewOn: 'Ver en Tropheo',
    schedule: 'Agenda',
    calendarView: 'Calendario',
    listView: 'Lista',
    viewDetails: 'Ver detalles',
    months: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
    daysShort: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
    directGames: 'Partidos Directos',
    games: 'Partidos',
    gamesOn: 'Partidos del',
    time: 'Hora',
    venue: 'Lugar',
    field: 'Campo',
  },
};

type Language = 'en' | 'es';
type Translations = (typeof translations)['en'];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ScheduleWidgetProps {
  /** Authenticated API client. */
  client: ApiClient;
  /** Root event ID whose schedule to display. */
  eventId: string;
  /**
   * Server-side organization filter — only games where this org participates
   * are included in the response.
   */
  organizationId?: string;
  /** Initial view mode.  @default 'calendar' */
  defaultView?: 'calendar' | 'list';
  /** Custom CSS class for the root element. */
  className?: string;
  /** Base Tropheo URL for deep links.  @default 'https://www.tropheo.com' */
  baseUrl?: string;
  /** Language for labels.  @default 'en' */
  lang?: 'en' | 'es';
  /** Visual theme overrides. */
  theme?: ScheduleTheme;
  /** Called when data loads successfully. */
  onLoad?: (gameCount: number) => void;
}

// ─── Date helpers (no external deps) ─────────────────────────────────────────

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function calendarDaysForMonth(year: number, month: number): Array<Date | null> {
  // month is 0-based
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  src,
  name,
  size = 28,
  bg,
}: {
  src?: string;
  name: string;
  size?: number;
  bg: string;
}) {
  const [errored, setErrored] = useState(false);
  const initial = (name || '?').charAt(0).toUpperCase();

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        onError={() => setErrored(true)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.42,
        fontWeight: 600,
        color: '#6b7280',
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

// ─── Compact Game Card ────────────────────────────────────────────────────────

function GameCard({
  game,
  t,
  th,
  baseUrl,
}: {
  game: WidgetGame;
  t: Translations;
  th: Required<ScheduleTheme>;
  baseUrl: string;
}) {
  const { gameInfo, status } = game;
  const isLive = status === 'ongoing';
  const isCompleted = status === 'completed';
  const hasScores = gameInfo != null && gameInfo.homeScore != null && gameInfo.awayScore != null;
  const homeWon = hasScores && Number(gameInfo!.homeScore) > Number(gameInfo!.awayScore);
  const awayWon = hasScores && Number(gameInfo!.awayScore) > Number(gameInfo!.homeScore);

  const inner = (
    <div
      style={{
        border: `1px solid ${th.borderColor}`,
        borderRadius: 8,
        background: th.cardBackground,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
      }}
      className="tropheo-sched-card"
    >
      {/* Status + time row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '5px 10px',
          borderBottom: `1px solid ${th.borderColor}`,
        }}
      >
        {isLive && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontWeight: 700,
              color: th.liveColor,
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: th.liveColor,
                animation: 'tropheo-pulse 1.5s infinite',
              }}
            />
            {t.live}
          </span>
        )}
        {!isLive && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: isCompleted ? th.mutedTextColor : '#f97316',
              textTransform: 'uppercase',
            }}
          >
            {isCompleted ? t.completed : t.upcoming}
          </span>
        )}
        {game.startDate && (
          <span style={{ fontSize: 11, color: th.mutedTextColor, marginLeft: 'auto' }}>
            {new Date(game.startDate).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>

      {/* Participants */}
      <div style={{ padding: '8px 10px' }}>
        {gameInfo && (gameInfo.homeName || gameInfo.awayName) ? (
          <div>
            {/* Away */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 6,
                marginBottom: 3,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <Avatar
                  src={gameInfo.awayImage}
                  name={gameInfo.awayName || 'A'}
                  bg={th.avatarBackground}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: awayWon ? th.winnerColor : th.textColor,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 140,
                  }}
                >
                  {gameInfo.awayName}
                </span>
              </div>
              {hasScores && (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: awayWon ? th.winnerColor : th.textColor,
                  }}
                >
                  {gameInfo.awayScore}
                </span>
              )}
            </div>
            {/* Home */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <Avatar
                  src={gameInfo.homeImage}
                  name={gameInfo.homeName || 'H'}
                  bg={th.avatarBackground}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: homeWon ? th.winnerColor : th.textColor,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 140,
                  }}
                >
                  {gameInfo.homeName}
                </span>
              </div>
              {hasScores && (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: homeWon ? th.winnerColor : th.textColor,
                  }}
                >
                  {gameInfo.homeScore}
                </span>
              )}
            </div>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: th.mutedTextColor }}>{game.name || 'Game'}</span>
        )}

        {/* Location */}
        {(game.venueName || game.fieldName) && (
          <p
            style={{
              margin: '5px 0 0',
              fontSize: 10,
              color: th.mutedTextColor,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            📍 {[game.fieldName, game.venueName].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <a
      href={`${baseUrl}/events/${game.id}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'block', textDecoration: 'none' }}
    >
      {inner}
    </a>
  );
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

function MiniCalendar({
  year,
  month,
  selectedDate,
  gameDays,
  onSelectDate,
  onChangeMonth,
  t,
  th,
}: {
  year: number;
  month: number;
  selectedDate: Date | null;
  gameDays: Set<string>;
  onSelectDate: (d: Date) => void;
  onChangeMonth: (delta: -1 | 1) => void;
  t: Translations;
  th: Required<ScheduleTheme>;
}) {
  const cells = calendarDaysForMonth(year, month);
  const today = new Date();

  return (
    <div style={{ padding: 12, userSelect: 'none' }}>
      {/* Month header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <button
          onClick={() => onChangeMonth(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            color: th.textColor,
            padding: '2px 6px',
          }}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: th.textColor }}>
          {t.months[month]} {year}
        </span>
        <button
          onClick={() => onChangeMonth(1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            color: th.textColor,
            padding: '2px 6px',
          }}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day-of-week header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 2,
          marginBottom: 4,
        }}
      >
        {t.daysShort.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: 10,
              fontWeight: 600,
              color: th.mutedTextColor,
              padding: '2px 0',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`empty-${idx}`} />;

          const key = toDateKey(cell);
          const hasGames = gameDays.has(key);
          const isSelected = selectedDate != null && sameDay(cell, selectedDate);
          const isToday = sameDay(cell, today);

          return (
            <button
              key={key}
              onClick={() => onSelectDate(cell)}
              style={{
                border: 'none',
                borderRadius: 6,
                padding: '4px 0',
                cursor: 'pointer',
                background: isSelected ? th.primaryColor : 'transparent',
                color: isSelected ? '#ffffff' : isToday ? th.primaryColor : th.textColor,
                fontWeight: isSelected || isToday ? 700 : 400,
                fontSize: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                position: 'relative',
              }}
            >
              {cell.getDate()}
              {hasGames && (
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: isSelected ? '#ffffff' : th.primaryColor,
                    display: 'block',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const ScheduleWidget: React.FC<ScheduleWidgetProps> = ({
  client,
  eventId,
  organizationId,
  defaultView = 'calendar',
  className = '',
  baseUrl = 'https://www.tropheo.com',
  lang = 'en',
  theme = {},
  onLoad,
}) => {
  const [allGames, setAllGames] = useState<WidgetGame[]>([]);
  const [stages, setStages] = useState<WidgetStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>(defaultView);

  // Calendar state
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const t = translations[lang as Language];

  // ── Resolved theme ──────────────────────────────────────────────────────────
  const th: Required<ScheduleTheme> = {
    cardBackground: theme.cardBackground ?? '#ffffff',
    borderColor: theme.borderColor ?? '#fed7aa',
    textColor: theme.textColor ?? '#111827',
    mutedTextColor: theme.mutedTextColor ?? '#6b7280',
    primaryColor: theme.primaryColor ?? '#3b82f6',
    liveColor: theme.liveColor ?? '#ef4444',
    toggleActiveBackground: theme.toggleActiveBackground ?? '#111827',
    toggleActiveText: theme.toggleActiveText ?? '#ffffff',
    footerBackground: theme.footerBackground ?? '#f9fafb',
    buttonBackground: theme.buttonBackground ?? '#3b82f6',
    buttonTextColor: theme.buttonTextColor ?? '#ffffff',
    avatarBackground: theme.avatarBackground ?? '#e5e7eb',
    winnerColor: theme.winnerColor ?? '#15803d',
  };

  // ── Data fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await client.getSchedule(eventId, organizationId);
        if (cancelled) return;

        if (!res.success || !res.data) {
          setError(res.error || 'Failed to load schedule');
          setLoading(false);
          return;
        }

        setAllGames(res.data.games);
        setStages(res.data.stages);
        onLoad?.(res.data.games.length);

        // Auto-select the first game date if available
        const sorted = [...res.data.games]
          .filter((g) => g.startDate)
          .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime());

        if (sorted.length > 0) {
          const firstDate = new Date(sorted[0].startDate!);
          setCalYear(firstDate.getFullYear());
          setCalMonth(firstDate.getMonth());
          // Set selected day to today if today has games, else first game date
          const todayKey = toDateKey(today);
          const gameDayKeys = new Set(sorted.map((g) => toDateKey(new Date(g.startDate!))));
          if (gameDayKeys.has(todayKey)) {
            setSelectedDate(today);
          } else {
            setSelectedDate(firstDate);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [eventId, organizationId]);

  // ── Derived data ────────────────────────────────────────────────────────────
  const gameDays = useMemo(() => {
    const s = new Set<string>();
    for (const g of allGames) {
      if (g.startDate) s.add(toDateKey(new Date(g.startDate)));
    }
    return s;
  }, [allGames]);

  const gamesForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    const key = toDateKey(selectedDate);
    return allGames.filter((g) => g.startDate && toDateKey(new Date(g.startDate)) === key);
  }, [allGames, selectedDate]);

  // Build stage→games map for list view
  const stageMap = useMemo(() => {
    const map = new Map<string, WidgetGame[]>();
    for (const g of allGames) {
      const sid = g.parentStageId || '__direct__';
      if (!map.has(sid)) map.set(sid, []);
      map.get(sid)!.push(g);
    }
    // Sort each group by startDate
    for (const arr of map.values()) {
      arr.sort(
        (a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime()
      );
    }
    return map;
  }, [allGames]);

  function handleMonthChange(delta: -1 | 1) {
    let m = calMonth + delta;
    let y = calYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    setCalMonth(m);
    setCalYear(y);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes tropheo-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .tropheo-sched-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
      `}</style>

      <div
        className={`tropheo-schedule ${className}`}
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          border: `1px solid ${th.borderColor}`,
          borderRadius: 12,
          overflow: 'hidden',
          background: th.cardBackground,
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: `1px solid ${th.borderColor}`,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: th.textColor }}>
            {t.schedule}
          </h3>

          {/* View toggle */}
          <div
            style={{
              display: 'flex',
              border: `1px solid ${th.borderColor}`,
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            {(['calendar', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: view === v ? th.toggleActiveBackground : 'transparent',
                  color: view === v ? th.toggleActiveText : th.mutedTextColor,
                  transition: 'all 0.12s',
                }}
              >
                {v === 'calendar' ? t.calendarView : t.listView}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        {loading ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: th.mutedTextColor }}>
            {t.loading}
          </div>
        ) : error ? (
          <div style={{ padding: '24px 16px', color: '#ef4444', fontSize: 13 }}>
            {t.error}: {error}
          </div>
        ) : allGames.length === 0 ? (
          <div style={{ padding: '24px 16px', color: th.mutedTextColor, fontSize: 13 }}>
            {t.noGames}
          </div>
        ) : view === 'calendar' ? (
          /* ── Calendar view ── */
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
          >
            {/* Left: mini calendar */}
            <div
              style={{
                width: 240,
                minWidth: 200,
                borderRight: `1px solid ${th.borderColor}`,
                flexShrink: 0,
              }}
            >
              <MiniCalendar
                year={calYear}
                month={calMonth}
                selectedDate={selectedDate}
                gameDays={gameDays}
                onSelectDate={setSelectedDate}
                onChangeMonth={handleMonthChange}
                t={t}
                th={th}
              />
            </div>

            {/* Right: games for selected day */}
            <div style={{ flex: 1, minWidth: 200, padding: 12, overflowY: 'auto', maxHeight: 460 }}>
              {selectedDate && (
                <p
                  style={{
                    margin: '0 0 8px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: th.textColor,
                  }}
                >
                  {t.gamesOn}{' '}
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
              {gamesForSelectedDay.length === 0 ? (
                <p style={{ fontSize: 13, color: th.mutedTextColor }}>{t.noGamesDay}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {gamesForSelectedDay.map((game) => (
                    <GameCard key={game.id} game={game} t={t} th={th} baseUrl={baseUrl} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── List view ── */
          <div style={{ padding: 12, overflowY: 'auto', maxHeight: 560 }}>
            {Array.from(stageMap.entries())
              .map(([stageId, gamesInStage]) => {
                const stage = stages.find((s) => s.id === stageId);
                const isRootGroup = stageId === '__direct__' || stageId === eventId;
                const sectionTitle = isRootGroup ? t.games : stage?.name || stageId;
                const firstDate = gamesInStage[0]?.startDate ?? null;
                return { stageId, gamesInStage, sectionTitle, isRootGroup, firstDate };
              })
              .sort((a, b) => {
                // Named stages first (sorted by first game date), root group last
                if (a.isRootGroup && !b.isRootGroup) return 1;
                if (!a.isRootGroup && b.isRootGroup) return -1;
                return new Date(a.firstDate || 0).getTime() - new Date(b.firstDate || 0).getTime();
              })
              .map(({ stageId, gamesInStage, sectionTitle }) => (
                <div key={stageId} style={{ marginBottom: 16 }}>
                  <h4
                    style={{
                      margin: '0 0 6px',
                      fontSize: 12,
                      fontWeight: 700,
                      color: th.mutedTextColor,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {sectionTitle}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {gamesInStage.map((game) => (
                      <GameCard key={game.id} game={game} t={t} th={th} baseUrl={baseUrl} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            background: th.footerBackground,
            borderTop: `1px solid ${th.borderColor}`,
          }}
        >
          <span style={{ fontSize: 11, color: th.mutedTextColor }}>
            {t.poweredBy}{' '}
            <a
              href="https://www.tropheo.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: th.mutedTextColor, fontWeight: 700, textDecoration: 'none' }}
            >
              Tropheo
            </a>
          </span>
          <a
            href={`${baseUrl}/events/${eventId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '5px 12px',
              borderRadius: 6,
              background: th.buttonBackground,
              color: th.buttonTextColor,
              textDecoration: 'none',
            }}
          >
            {t.viewOn} ↗
          </a>
        </div>
      </div>
    </>
  );
};
