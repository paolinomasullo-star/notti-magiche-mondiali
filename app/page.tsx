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
  const [messaggio, setMessaggio] = useState('')
  const [team, setTeam] = useState(null)

  async function login() {
    setMessaggio('Controllo in corso...')

    const { data, error } = await supabase
      .from('Teams')
      .select('*')
      .eq('nome_squadra', nome.trim())
      .eq('password', password.trim())

    if (error) {
      setMessaggio('Errore Supabase: ' + error.message)
      return
    }

    setMessaggio('Risultati trovati: ' + data.length)

    if (data.length === 0) {
      return
    }

    setTeam(data[0])
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
    </main>
  )
}
