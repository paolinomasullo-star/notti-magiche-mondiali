'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://efpaurctoyvcegyeqzti.supabase.co',
  'sb_publishable_Jbae6ZpDeGfvZ9Gji3WMFg_vu20QygE'
)

export default function Home() {
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [team, setTeam] = useState(null)

  const [nome, setNome] = useState('')
  const [password, setPassword] = useState('')

  const [pronostici, setPronostici] = useState({})
  const [messaggio, setMessaggio] = useState('')

  useEffect(() => {
    caricaTeams()
    caricaMatches()
  }, [])

  async function caricaTeams() {
    const { data } = await supabase.from('Teams').select('*')
    setTeams(data || [])
  }

  async function caricaMatches() {
    const { data } = await supabase.from('matches').select('*')
    setMatches(data || [])
  }

  function login() {
    const nomePulito = nome.trim().toLowerCase()
    const passwordPulita = password.trim().toLowerCase()

    const trovato = teams.find((t) => {
      return (
        t.nome_squadra.toLowerCase().trim() === nomePulito &&
        t.password.toLowerCase().trim() === passwordPulita
      )
    })

    if (!trovato) {
      setMessaggio('Credenziali sbagliate')
      return
    }

    setTeam(trovato)
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
    if (!team) {
      alert('Devi fare login')
      return
    }

    const p = pronostici[matchId]

    if (!p || !p.casa || !p.trasferta) {
      alert('Inserisci entrambi i gol')
      return
    }

    const { error } = await supabase.from('prediction').insert({
      team_id: team.id,
      match_id: matchId,
      gol_casa: parseInt(p.casa),
      gol_trasferta: parseInt(p.trasferta)
    })

    if (error) {
      alert('Errore salvataggio: ' + error.message)
      return
    }

    alert('Pronostico salvato!')
  }

  if (!team) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Notti Magiche Mondiali ⚽</h1>

        <h2>Login squadra</h2>

        <input
          placeholder="nome squadra"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginLeft: 10 }}
        />

        <button onClick={login} style={{ marginLeft: 10 }}>
          Entra
        </button>

        <p>{messaggio}</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Notti Magiche Mondiali ⚽</h1>

      <h2>Ciao {team.nome_squadra}</h2>

      <h3>Partite</h3>

      {matches.map((match) => (
        <div key={match.id} style={{ marginBottom: 20 }}>
          <div>
            {match.squadra_casa} vs {match.squadra_trasferta}
          </div>

          <input
            placeholder="gol casa"
            onChange={(e) =>
              aggiornaPronostico(match.id, 'casa', e.target.value)
            }
          />

          <input
            placeholder="gol trasferta"
            onChange={(e) =>
              aggiornaPronostico(match.id, 'trasferta', e.target.value)
            }
            style={{ marginLeft: 10 }}
          />

          <button
            onClick={() => salvaPronostico(match.id)}
            style={{ marginLeft: 10 }}
          >
            Salva
          </button>
        </div>
      ))}
    </main>
  )
}
