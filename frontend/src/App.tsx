import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface Song {
  id: number
  name: string
  timesSung: number
}

function App() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/songs`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Backend odpověděl chybou (${res.status})`)
        }
        return res.json()
      })
      .then((data: Song[]) => setSongs(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="songs-page">
      <h1>Zpívané písně</h1>

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
