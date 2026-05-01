'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://efpaurctoyvcegyeqzti.supabase.co',
  'sb_publishable_Jbae6ZpDeGfvZ9Gji3WMFg_vu20QygE'
)

export default function Home() {
  const [matches, setMatches] = useState([])
  const [pronostici, setPronostici] = useState({})

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    const { data } = await supabase
      .from('matches')
      .select('*')

    setMatches(data || [])
  }

  function aggiornaPronostico(matchId, campo, valore) {
    setPronostici({
      ...pronostici,
      [matchId]: {
        ...pronostici[matchId],
        [campo]: valore
      }
    })
  }

  async function salvaPronostico(matchId) {
    const p = pronostici[matchId]

    if (!p || !p.casa || !p.trasferta) {
      alert('Inserisci entrambi i gol')
      return
    }

    await supabase.from('predictions').insert({
      match_id: matchId,
      gol_casa: parseInt(p.casa),
      gol_trasferta: parseInt(p.trasferta)
    })

    alert('Pronostico salvato!')
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Notti Magiche Mondiali ⚽</h1>

      <h2>Partite</h2>

      {matches.map((match) => (
        <div key={match.id} style={{ marginBottom: 20 }}>
          <div>
            {match.squadra_casa} vs {match.squadra_trasferta}
          </div>

          <div style={{ marginTop: 10 }}>
            <input
              placeholder="gol casa"
              onChange={(e) =>
                aggiornaPronostico(match.id, 'casa', e.target.value)
              }
            />

            <input
              placeholder="gol trasferta"
              style={{ marginLeft: 10 }}
              onChange={(e) =>
                aggiornaPronostico(match.id, 'trasferta', e.target.value)
              }
            />

            <button
              style={{ marginLeft: 10 }}
              onClick={() => salvaPronostico(match.id)}
            >
              Salva
            </button>
          </div>
        </div>
      ))}
    </main>
  )
}
