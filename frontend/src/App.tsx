import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface Song {
  id: number
  name: string
  dates: string[]
}

interface DateRange {
  from: string | null
  to: string | null
}

type Tab = 'all' | 'year' | 'month' | 'week'
type SortField = 'count' | 'lastSung' | 'alpha'
type SortDirection = 'desc' | 'asc'

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'Vše' },
  { id: 'year', label: 'Poslední rok' },
  { id: 'month', label: 'Poslední měsíc' },
  { id: 'week', label: 'Poslední týden' },
]

const SORT_FIELD_OPTIONS: { id: SortField; label: string }[] = [
  { id: 'count', label: 'Počet zazpívání' },
  { id: 'lastSung', label: 'Naposledy zpíváno' },
  { id: 'alpha', label: 'Abecedně' },
]

const SORT_DIRECTION_OPTIONS: { id: SortDirection; label: string }[] = [
  { id: 'desc', label: 'Sestupně' },
  { id: 'asc', label: 'Vzestupně' },
]

const HINT_DISMISSED_KEY = 'kj-songs-hint-dismissed'

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('cs-CZ')
}

// Cutoff is relative to the latest date actually present in the data,
// not today's real date — the data can lag behind by weeks.
function cutoffFor(tab: Tab, anchor: Date | null): Date | null {
  if (tab === 'all' || !anchor) return null
  const cutoff = new Date(anchor)
  if (tab === 'year') cutoff.setFullYear(cutoff.getFullYear() - 1)
  if (tab === 'month') cutoff.setMonth(cutoff.getMonth() - 1)
  if (tab === 'week') cutoff.setDate(cutoff.getDate() - 7)
  return cutoff
}

// Songs never sung (or not sung within the selected period) sort as
// oldest — they have no last-sung date to compare against.
function lastSungTime(dates: string[]): number {
  if (dates.length === 0) return -Infinity
  return Math.max(...dates.map((date) => new Date(date).getTime()))
}

function compareByField(a: Song, b: Song, field: SortField): number {
  if (field === 'alpha') return a.name.localeCompare(b.name, 'cs')
  if (field === 'lastSung') return lastSungTime(a.dates) - lastSungTime(b.dates)
  return a.dates.length - b.dates.length
}

function SongTimeline({ dates }: { dates: string[] }) {
  const sorted = [...dates].sort()
  const first = new Date(sorted[0]).getTime()
  const last = new Date(sorted[sorted.length - 1]).getTime()
  const span = last - first || 1

  return (
    <div className="song-timeline">
      <div className="song-timeline-axis">
        {sorted.map((date, i) => {
          const percent = ((new Date(date).getTime() - first) / span) * 100
          return (
            <span
              key={i}
              className="song-timeline-dot"
              style={{ left: `${percent}%` }}
              title={formatDate(date)}
            />
          )
        })}
      </div>
      <div className="song-timeline-labels">
        <span>{formatDate(sorted[0])}</span>
        {sorted.length > 1 && <span>{formatDate(sorted[sorted.length - 1])}</span>}
      </div>
      <ul className="song-dates-list">
        {[...sorted].reverse().map((date, i) => (
          <li key={i}>{formatDate(date)}</li>
        ))}
      </ul>
    </div>
  )
}

function App() {
  const [songs, setSongs] = useState<Song[]>([])
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('all')
  const [sortField, setSortField] = useState<SortField>('count')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showHint, setShowHint] = useState(
    () => localStorage.getItem(HINT_DISMISSED_KEY) !== 'true',
  )

  const dismissHint = () => {
    localStorage.setItem(HINT_DISMISSED_KEY, 'true')
    setShowHint(false)
  }

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/songs`).then((res) => {
        if (!res.ok) {
          throw new Error(`Backend odpověděl chybou (${res.status})`)
        }
        return res.json() as Promise<Song[]>
      }),
      fetch(`${API_URL}/songs/date-range`).then((res) => {
        if (!res.ok) {
          throw new Error(`Backend odpověděl chybou (${res.status})`)
        }
        return res.json() as Promise<DateRange>
      }),
    ])
      .then(([songsData, dateRangeData]) => {
        setSongs(songsData)
        setDateRange(dateRangeData)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const anchor = dateRange?.to ? new Date(dateRange.to) : null

  const headerRange = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return null
    if (tab === 'all') return { from: dateRange.from, to: dateRange.to }

    const cutoff = cutoffFor(tab, anchor)
    return cutoff ? { from: cutoff.toISOString(), to: dateRange.to } : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, tab])

  const visibleSongs = useMemo(() => {
    const cutoff = cutoffFor(tab, anchor)

    const filtered = songs
      .map((song) => ({
        ...song,
        dates: cutoff ? song.dates.filter((date) => new Date(date) > cutoff) : song.dates,
      }))
      .filter((song) => tab === 'all' || song.dates.length > 0)

    filtered.sort((a, b) => compareByField(a, b, sortField))
    if (sortDirection === 'desc') filtered.reverse()

    return filtered
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songs, tab, sortField, sortDirection])

  return (
    <div className="songs-page">
      <h1>Zpívané písně na KJ</h1>
      {headerRange && (
        <p className="date-range">
          {formatDate(headerRange.from)} – {formatDate(headerRange.to)}
        </p>
      )}

      <div className="controls">
        <div className="control">
          <label htmlFor="period-select">Období:</label>
          <select
            id="period-select"
            value={tab}
            onChange={(event) => {
              setTab(event.target.value as Tab)
              setExpandedId(null)
            }}
          >
            {TABS.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="control">
          <label htmlFor="sort-field-select">Řadit podle:</label>
          <select
            id="sort-field-select"
            value={sortField}
            onChange={(event) => setSortField(event.target.value as SortField)}
          >
            {SORT_FIELD_OPTIONS.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="control">
          <label htmlFor="sort-direction-select">Pořadí:</label>
          <select
            id="sort-direction-select"
            value={sortDirection}
            onChange={(event) => setSortDirection(event.target.value as SortDirection)}
          >
            {SORT_DIRECTION_OPTIONS.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p>Načítám...</p>}
      {error && <p className="error">Nepodařilo se načíst data: {error}</p>}

      {!loading && !error && showHint && (
        <div className="hint">
          <span>💡 Tip: klikni na píseň a uvidíš, kdy přesně se zpívala.</span>
          <button className="hint-close" onClick={dismissHint} aria-label="Zavřít">
            ×
          </button>
        </div>
      )}

      {!loading && !error && (
        <ul className="songs-list">
          {visibleSongs.map((song) => (
            <li key={song.id} className="songs-list-item-wrapper">
              <button
                className="songs-list-item"
                onClick={() => {
                  setExpandedId(expandedId === song.id ? null : song.id)
                  dismissHint()
                }}
              >
                <span className="song-name">{song.name}</span>
                <span className="song-count">{song.dates.length}×</span>
              </button>
              {expandedId === song.id && <SongTimeline dates={song.dates} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
