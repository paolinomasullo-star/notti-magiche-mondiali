'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://efpaurctoyvcegyeqzti.supabase.co',
  'sb_publishable_Jbae6ZpDeGfvZ9Gji3WMFg_vu20QygE'
)

export default function Home() {
  const [matches, setMatches] = useState([])

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    const { data, error } = await supabase
      .from('matches')
      .select('*')

    if (!error) {
      setMatches(data)
    }
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
            <input placeholder="gol casa" />
            <input placeholder="gol trasferta" style={{ marginLeft: 10 }} />
            <button style={{ marginLeft: 10 }}>Salva</button>
          </div>
        </div>
      ))}
    </main>
  )
}
