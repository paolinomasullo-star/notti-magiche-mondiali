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
  const [classifica, setClassifica] = useState([])
  const [messaggio, setMessaggio] = useState('')

  useEffect(() => {
    caricaDati()
  }, [])

  async function caricaDati() {
    const { data: teamsData } = await supabase.from('Teams').select('*')
    const { data: matchesData } = await supabase.from('matches').select('*')
    const { data: predictionData } = await supabase.from('prediction').select('*')

    setTeams(teamsData || [])
    setMatches(matchesData || [])

    calcolaClassifica(teamsData || [], predictionData || [])
  }

  function login() {
    const trovato = teams.find((t) =>
      t.nome_squadra.toLowerCase().trim() === nome.trim().toLowerCase() &&
      t.password.toLowerCase().trim() === password.trim().toLowerCase()
    )

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

  function calcolaPunti(pronCasa, pronTrasferta, realeCasa, realeTrasferta) {
    if (realeCasa === null || realeTrasferta === null) return 0
    if (realeCasa === undefined || realeTrasferta === undefined) return 0

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

  function calcolaClassifica(listaTeams, listaPronostici) {
    const nuovaClassifica = listaTeams.map((t) => {
      const puntiTotali = listaPronostici
        .filter((p) => p.team_id === t.id)
        .reduce((totale, p) => totale + (p.punti || 0), 0)

      return {
        id: t.id,
        nome_squadra: t.nome_squadra,
        punti: puntiTotali
      }
    })

    nuovaClassifica.sort((a, b) => b.punti - a.punti)
    setClassifica(nuovaClassifica)
  }

  async function salvaPronostico(match) {
    if (!team) {
      alert('Devi fare login')
      return
    }

    const p = pronostici[match.id]

    if (!p || p.casa === undefined || p.trasferta === undefined || p.casa === '' || p.trasferta === '') {
      alert('Inserisci entrambi i gol')
      return
    }

    const pronCasa = parseInt(p.casa)
    const pronTrasferta = parseInt(p.trasferta)

    const punti = calcolaPunti(
      pronCasa,
      pronTrasferta,
      match.gol_casa,
      match.gol_trasferta
    )

    const { error } = await supabase.from('prediction').insert({
      team_id: team.id,
      match_id: match.id,
      gol_casa: pronCasa,
      gol_trasferta: pronTrasferta,
      punti: punti
    })

    if (error) {
      alert('Errore salvataggio: ' + error.message)
      return
    }

    await caricaDati()
    alert('Pronostico salvato! Punti: ' + punti)
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
            onClick={() => salvaPronostico(match)}
            style={{ marginLeft: 10 }}
          >
            Salva
          </button>

          <div style={{ fontSize: 13, marginTop: 5 }}>
            Risultato reale: {match.gol_casa ?? '-'} - {match.gol_trasferta ?? '-'}
          </div>
        </div>
      ))}

      <h3>Classifica</h3>

      {classifica.map((t) => (
        <div key={t.id}>
          {t.nome_squadra} → {t.punti} punti
        </div>
      ))}
    </main>
  )
}
