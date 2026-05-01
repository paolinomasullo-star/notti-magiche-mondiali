'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://efpaurctoyvcegyeqzti.supabase.co',
  'sb_publishable_Jbae6ZpDeGfvZ9Gji3WMFg_vu20QygE'
)

export default function Home() {
  const [nome, setNome] = useState('')
  const [password, setPassword] = useState('')
  const [team, setTeam] = useState(null)
  const [teams, setTeams] = useState([])
  const [messaggio, setMessaggio] = useState('')

  useEffect(() => {
    caricaTeams()
  }, [])

  async function caricaTeams() {
    const { data, error } = await supabase
      .from('Teams')
      .select('*')

    if (error) {
      setMessaggio('Errore lettura Teams: ' + error.message)
      return
    }

    setTeams(data || [])
  }

 async function login() {
  const nomePulito = nome.trim().toLowerCase()
  const passwordPulita = password.trim()

  const trovato = teams.find(
    (t) =>
      t.nome_squadra.toLowerCase() === nomePulito &&
      t.password === passwordPulita
  )

  if (!trovato) {
    setMessaggio(
      'Credenziali sbagliate. Sto leggendo ' + teams.length + ' squadre.'
    )
    return
  }

  setTeam(trovato)
}

  if (team) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Notti Magiche Mondiali ⚽</h1>
        <h2>Ciao {team.nome_squadra}</h2>
      </main>
    )
  }

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

      <h3>Debug squadre lette da Supabase</h3>

      {teams.map((t) => (
        <div key={t.id}>
          {t.nome_squadra} / {t.password}
        </div>
      ))}
    </main>
  )
}
