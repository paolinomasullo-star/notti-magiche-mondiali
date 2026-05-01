
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://efpaurctoyvcegyeqzti.supabase.co',
  'sb_publishable_Jbae6ZpDeGfvZ9Gji3WMFg_vu20QygE'
)

type Match = {
  id: number
  fase: string
  squadra_casa: string
  squadra_trasferta: string
  data_ora: string
  gol_casa: number | null
  gol_trasferta: number | null
  qualificata: string | null
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [errore, setErrore] = useState('')

  useEffect(() => {
    fetchMatches()
  }, [])

  async function fetchMatches() {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('data_ora', { ascending: true })

    if (error) {
      setErrore(error.message)
    } else {
      setMatches(data || [])
    }

    setLoading(false)
  }

  return (
    <main>
      <h1>Notti Magiche Mondiali ⚽</h1>
      <p>Primo test del gioco di pronostici.</p>

      <div className="card">
        <h2>Partite</h2>

        {loading && <p>Caricamento partite...</p>}

        {errore && (
          <p className="error">
            Errore collegamento Supabase: {errore}
          </p>
        )}

        {!loading && !errore && matches.length === 0 && (
          <p>Nessuna partita trovata nel database.</p>
        )}

        {matches.map((match) => (
          <div className="match" key={match.id}>
            <div>
              <strong>{match.squadra_casa} vs {match.squadra_trasferta}</strong>
              <div className="small">{match.fase}</div>
            </div>
            <div className="small">
              {match.data_ora ? new Date(match.data_ora).toLocaleString('it-IT') : ''}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
