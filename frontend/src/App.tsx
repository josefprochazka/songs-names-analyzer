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

type Tab = 'all' | 'year' | 'month'

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'Vše' },
  { id: 'year', label: 'Poslední rok' },
  { id: 'month', label: 'Poslední měsíc' },
]

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('cs-CZ')
}

function cutoffFor(tab: Tab): Date | null {
  if (tab === 'all') return null
  const cutoff = new Date()
  if (tab === 'year') cutoff.setFullYear(cutoff.getFullYear() - 1)
  if (tab === 'month') cutoff.setMonth(cutoff.getMonth() - 1)
  return cutoff
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
  const [expandedId, setExpandedId] = useState<number | null>(null)

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

  const visibleSongs = useMemo(() => {
    const cutoff = cutoffFor(tab)

    return songs
      .map((song) => ({
        ...song,
        dates: cutoff ? song.dates.filter((date) => new Date(date) >= cutoff) : song.dates,
      }))
      .filter((song) => tab === 'all' || song.dates.length > 0)
      .sort((a, b) => b.dates.length - a.dates.length)
  }, [songs, tab])

  return (
    <div className="songs-page">
      <h1>Zpívané písně</h1>
      {dateRange?.from && dateRange?.to && (
        <p className="date-range">
          {formatDate(dateRange.from)} – {formatDate(dateRange.to)}
        </p>
      )}

      <div className="tabs">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            className={id === tab ? 'tab tab-active' : 'tab'}
            onClick={() => {
              setTab(id)
              setExpandedId(null)
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p>Načítám...</p>}
      {error && <p className="error">Nepodařilo se načíst data: {error}</p>}

      {!loading && !error && (
        <ul className="songs-list">
          {visibleSongs.map((song) => (
            <li key={song.id} className="songs-list-item-wrapper">
              <button
                className="songs-list-item"
                onClick={() => setExpandedId(expandedId === song.id ? null : song.id)}
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
