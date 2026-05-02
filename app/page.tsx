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
    caricaDati()
  }, [])

  async function caricaDati() {
    const { data: teamsData } = await supabase.from('Teams').select('*')
    const { data: matchesData } = await supabase
      .from('matches')
      .select('*')
      .order('data_ora', { ascending: true })

    setTeams(teamsData || [])
    setMatches(matchesData || [])
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
    setMessaggio('')
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

  async function inviaPronostico(match) {
    const p = pronostici[match.id]

    if (!p || p.casa === undefined || p.trasferta === undefined || p.casa === '' || p.trasferta === '') {
      alert('Inserisci entrambi i gol')
      return
    }

    const golCasa = parseInt(p.casa)
    const golTrasferta = parseInt(p.trasferta)

    if (isNaN(golCasa) || isNaN(golTrasferta) || golCasa < 0 || golTrasferta < 0) {
      alert('Inserisci numeri validi')
      return
    }

    await supabase
      .from('prediction')
      .delete()
      .eq('team_id', team.id)
      .eq('match_id', match.id)

    const { error } = await supabase.from('prediction').insert({
      team_id: team.id,
      match_id: match.id,
      gol_casa: golCasa,
      gol_trasferta: golTrasferta,
      punti: 0,
      inviato_il: new Date().toISOString()
    })

    if (error) {
      alert('Errore invio: ' + error.message)
      return
    }

    alert('Pronostico inviato correttamente!')
  }

  if (!team) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <h1 style={styles.title}>Notti Magiche Mondiali ⚽</h1>
          <p style={styles.subtitle}>Il gioco di pronostici tra amici.</p>

          <h2>Accesso squadra</h2>

          <div style={styles.row}>
            <input
              style={styles.input}
              placeholder="Nome squadra"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button style={styles.button} onClick={login}>
              Entra
            </button>
          </div>

          {messaggio && <p style={styles.error}>{messaggio}</p>}
        </section>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Notti Magiche Mondiali ⚽</h1>
        <p style={styles.subtitle}>Ciao, {team.nome_squadra}</p>

        <h2>Pronostici</h2>
        <p style={styles.note}>
          Inserisci il risultato e premi “Invia”. Se cambi idea, puoi inviare di nuovo:
          varrà l’ultimo pronostico registrato prima dell’inizio della partita.
        </p>

        {matches.map((match) => (
          <div key={match.id} style={styles.match}>
            <div>
              <strong>{match.squadra_casa} vs {match.squadra_trasferta}</strong>
              <div style={styles.small}>{match.fase}</div>
              <div style={styles.small}>
                Inizio: {match.data_ora ? new Date(match.data_ora).toLocaleString('it-IT') : 'orario da definire'}
              </div>
            </div>

            <div style={styles.predictionBox}>
              <input
                style={styles.scoreInput}
                placeholder="0"
                type="number"
                min="0"
                onChange={(e) =>
                  aggiornaPronostico(match.id, 'casa', e.target.value)
                }
              />

              <span style={styles.dash}>-</span>

              <input
                style={styles.scoreInput}
                placeholder="0"
                type="number"
                min="0"
                onChange={(e) =>
                  aggiornaPronostico(match.id, 'trasferta', e.target.value)
                }
              />

              <button style={styles.button} onClick={() => inviaPronostico(match)}>
                Invia
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #07142b, #102f5f)',
    color: 'white',
    padding: 24,
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    maxWidth: 900,
    margin: '0 auto',
    background: 'rgba(255,255,255,0.10)',
    borderRadius: 24,
    padding: 28,
    boxShadow: '0 15px 40px rgba(0,0,0,0.25)'
  },
  title: {
    color: '#ffd166',
    fontSize: 38,
    marginBottom: 6
  },
  subtitle: {
    opacity: 0.9,
    marginTop: 0
  },
  row: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap'
  },
  input: {
    padding: 12,
    borderRadius: 10,
    border: 'none',
    minWidth: 180
  },
  button: {
    padding: '12px 16px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    background: '#ffd166'
  },
  error: {
    color: '#ffb4b4'
  },
  note: {
    opacity: 0.85,
    lineHeight: 1.5
  },
  match: {
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    background: 'rgba(255,255,255,0.12)',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  small: {
    fontSize: 14,
    opacity: 0.75,
    marginTop: 4
  },
  predictionBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  scoreInput: {
    width: 64,
    padding: 10,
    borderRadius: 10,
    border: 'none',
    textAlign: 'center',
    fontSize: 16
  },
  dash: {
    fontWeight: 'bold',
    fontSize: 20
  }
}
