"use client"

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const MazeGame = dynamic(() => import('./maze-game'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-white text-xl">Carregando...</div>
    </div>
  ),
})

export default function ClientMazeGame() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return <MazeGame />
} 