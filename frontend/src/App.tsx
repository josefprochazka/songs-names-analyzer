import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface Song {
  id: number
  name: string
  timesSung: number
}

interface DateRange {
  from: string | null
  to: string | null
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('cs-CZ')
}

function App() {
  const [songs, setSongs] = useState<Song[]>([])
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="songs-page">
      <h1>Zpívané písně</h1>
      {dateRange?.from && dateRange?.to && (
        <p className="date-range">
          {formatDate(dateRange.from)} – {formatDate(dateRange.to)}
        </p>
      )}

      {loading && <p>Načítám...</p>}
      {error && <p className="error">Nepodařilo se načíst data: {error}</p>}

      {!loading && !error && (
        <ul className="songs-list">
          {songs.map((song) => (
            <li key={song.id} className="songs-list-item">
              <span className="song-name">{song.name}</span>
              <span className="song-count">{song.timesSung}×</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
