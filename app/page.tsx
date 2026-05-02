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
  const [pronosticiLista, setPronosticiLista] = useState([])
  const [messaggio, setMessaggio] = useState('')

  useEffect(() => {
    caricaTeams()
    caricaMatches()
    caricaPronostici()
  }, [])

  async function caricaTeams() {
    const { data } = await supabase.from('Teams').select('*')
    setTeams(data || [])
  }

  async function caricaMatches() {
    const { data } = await supabase.from('matches').select('*')
    setMatches(data || [])
  }

  async function caricaPronostici() {
    const { data } = await supabase.from('prediction').select('*')
    setPronosticiLista(data || [])
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

    await caricaPronostici()
    alert('Pronostico salvato!')
  }

  function calcolaPunti(p, match) {
    if (match.gol_casa == null || match.gol_trasferta == null) {
      return 0
    }

    const realeCasa = match.gol_casa
    const realeTrasferta = match.gol_trasferta
    const pronCasa = p.gol_casa
    const pronTrasferta = p.gol_trasferta

    if (pronCasa === realeCasa && pronTrasferta === realeTrasferta) {
      return 10
    }

    const diffReale = realeCasa - realeTrasferta
    const diffPron = pronCasa - pronTrasferta

    if (diffReale !== 0 && diffReale === diffPron) {
      return 5
    }

    if (
      (diffReale > 0 && diffPron > 0) ||
      (diffReale < 0 && diffPron < 0) ||
      (diffReale === 0 && diffPron === 0)
    ) {
      return 3
    }

    if (pronCasa + pronTrasferta === realeCasa + realeTrasferta) {
      return 1
    }

    return 0
  }

  function puntiSquadra(teamId) {
    let totale = 0

    pronosticiLista.forEach((p) => {
      if (p.team_id !== teamId) return

      const match = matches.find((m) => m.id === p.match_id)
      if (!match) return

      totale += calcolaPunti(p, match)
    })

    return totale
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

      <h3>Classifica</h3>

      {teams
        .map((t) => ({
          ...t,
          punti: puntiSquadra(t.id)
        }))
        .sort((a, b) => b.punti - a.punti)
        .map((t) => (
          <div key={t.id}>
            {t.nome_squadra} → {t.punti} punti
          </div>
        ))}
    </main>
  )
}
