"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// Definição do labirinto: 0 = caminho, 1 = parede
const MAZE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

// Posições iniciais dos corações
const INITIAL_HEARTS = [
  { x: 1, y: 1 },
  { x: 13, y: 1 },
  { x: 1, y: 9 },
  { x: 13, y: 9 },
  { x: 7, y: 5 },
]

const CELL_SIZE = 40 // Tamanho da célula

export default function MazeGame() {
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 })
  const [enemyPos, setEnemyPos] = useState({ x: 13, y: 9 })
  const [hearts, setHearts] = useState([...INITIAL_HEARTS])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const [cellSize, setCellSize] = useState(CELL_SIZE)

  // Iniciar o jogo
  const startGame = () => {
    setPlayerPos({ x: 1, y: 1 })
    setEnemyPos({ x: 13, y: 9 })
    setHearts([...INITIAL_HEARTS])
    setScore(0)
    setGameOver(false)
    setGameWon(false)
    setGameStarted(true)
  }

  // Reiniciar o jogo
  const restartGame = () => {
    startGame()
  }

  // Mover o jogador
  const movePlayer = (dx: number, dy: number) => {
    if (!gameStarted || gameOver || gameWon) return

    const newX = playerPos.x + dx
    const newY = playerPos.y + dy

    // Verificar se a nova posição é válida (não é uma parede)
    if (newX >= 0 && newX < MAZE[0].length && newY >= 0 && newY < MAZE.length && MAZE[newY][newX] === 0) {
      setPlayerPos({ x: newX, y: newY })

      // Verificar se o jogador coletou um coração
      const heartIndex = hearts.findIndex((heart) => heart.x === newX && heart.y === newY)
      if (heartIndex !== -1) {
        const newHearts = [...hearts]
        newHearts.splice(heartIndex, 1)
        setHearts(newHearts)
        setScore(score + 1)

        // Verificar se o jogador coletou todos os corações
        if (score + 1 >= 5) {
          setGameWon(true)
        }
      }
    }
  }

  // Mover o inimigo em direção ao jogador
  const moveEnemy = () => {
    if (!gameStarted || gameOver || gameWon) return

    // Algoritmo simples para o inimigo seguir o jogador
    const path = findPathToPlayer(enemyPos, playerPos)
    if (path.length > 1) {
      const nextStep = path[1] // O primeiro passo é a posição atual do inimigo
      setEnemyPos(nextStep)

      // Verificar se o inimigo alcançou o jogador
      if (nextStep.x === playerPos.x && nextStep.y === playerPos.y) {
        setGameOver(true)
      }
    }
  }

  // Encontrar caminho do inimigo até o jogador usando BFS
  const findPathToPlayer = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const queue: { pos: { x: number; y: number }; path: { x: number; y: number }[] }[] = [{ pos: start, path: [start] }]
    const visited = new Set<string>()
    visited.add(`${start.x},${start.y}`)

    const directions = [
      { dx: 0, dy: -1 }, // cima
      { dx: 1, dy: 0 }, // direita
      { dx: 0, dy: 1 }, // baixo
      { dx: -1, dy: 0 }, // esquerda
    ]

    while (queue.length > 0) {
      const { pos, path } = queue.shift()!

      // Se encontrou o jogador, retorna o caminho
      if (pos.x === end.x && pos.y === end.y) {
        return path
      }

      // Tenta mover em todas as direções
      for (const { dx, dy } of directions) {
        const newX = pos.x + dx
        const newY = pos.y + dy

        // Verifica se a nova posição é válida
        if (
          newX >= 0 &&
          newX < MAZE[0].length &&
          newY >= 0 &&
          newY < MAZE.length &&
          MAZE[newY][newX] === 0 &&
          !visited.has(`${newX},${newY}`)
        ) {
          const newPos = { x: newX, y: newY }
          const newPath = [...path, newPos]
          queue.push({ pos: newPos, path: newPath })
          visited.add(`${newX},${newY}`)
        }
      }
    }

    // Se não encontrar caminho, retorna apenas a posição atual
    return [start]
  }

  // Loop principal do jogo
  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon) {
      gameLoopRef.current = setInterval(() => {
        moveEnemy()
      }, 300) // O inimigo se move a cada 300ms
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [gameStarted, gameOver, gameWon, playerPos, enemyPos])

  // Verificar colisão com o inimigo
  useEffect(() => {
    if (playerPos.x === enemyPos.x && playerPos.y === enemyPos.y) {
      setGameOver(true)
    }
  }, [playerPos, enemyPos])

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          movePlayer(0, -1)
          break
        case "ArrowRight":
          movePlayer(1, 0)
          break
        case "ArrowDown":
          movePlayer(0, 1)
          break
        case "ArrowLeft":
          movePlayer(-1, 0)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [playerPos, gameStarted, gameOver, gameWon, score])

  // Adicione esta função para calcular o tamanho da célula
  const calculateCellSize = () => {
    const screenWidth = window.innerWidth
    const mazeWidth = MAZE[0].length
    const padding = 32 // padding de 16px de cada lado
    
    // Para telas pequenas (mobile)
    if (screenWidth < 640) {
      const availableWidth = screenWidth - padding
      const newCellSize = Math.floor(availableWidth / mazeWidth)
      setCellSize(newCellSize)
    } else {
      // Para telas maiores, mantém o tamanho original
      setCellSize(CELL_SIZE)
    }
  }

  // Adicione este useEffect para recalcular o tamanho quando a tela for redimensionada
  useEffect(() => {
    calculateCellSize()
    window.addEventListener('resize', calculateCellSize)
    return () => window.removeEventListener('resize', calculateCellSize)
  }, [])

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-purple-900 to-black p-4 sm:p-8">
      {/* Título do jogo com efeito de brilho */}
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-6 animate-pulse">
        labirinto da tonton
      </h1>

      {/* Placar com efeito de vidro */}
      <div className="mb-6 backdrop-blur-md bg-white/10 rounded-full px-8 py-3 shadow-lg border border-white/20">
        <div className="flex items-center gap-2">
          <Image src="/images/heart.png" alt="Coração" width={24} height={24} className="animate-bounce" />
          <span className="text-2xl font-bold text-white">
            {score} <span className="text-pink-400">/</span> 5
          </span>
        </div>
      </div>

      {!gameStarted ? (
        <div className="flex flex-col items-center backdrop-blur-md bg-white/5 p-8 rounded-2xl border border-white/10 shadow-xl">
          <p className="text-white mb-6 text-center text-xl leading-relaxed">
            Colete <span className="text-pink-400 font-bold">5 corações</span> no labirinto enquanto foge do
            <span className="text-red-400 font-bold"> rs</span>!
          </p>
          <Button 
            onClick={startGame} 
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 
                     text-xl py-6 px-12 rounded-full transform hover:scale-105 transition-all duration-300 
                     shadow-lg hover:shadow-pink-500/50"
          >
            Iniciar Aventura
          </Button>
        </div>
      ) : (
        <>
          {/* Labirinto com tamanho responsivo */}
          <div
            className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl
                       animate-[glow_4s_ease-in-out_infinite] border-2 border-purple-500/50"
            style={{
              width: MAZE[0].length * cellSize,
              height: MAZE.length * cellSize,
            }}
          >
            {/* Renderizar o labirinto */}
            {MAZE.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`absolute ${cell === 1 ? "bg-gray-700" : "bg-gray-800"}`}
                  style={{
                    left: x * cellSize,
                    top: y * cellSize,
                    width: cellSize,
                    height: cellSize,
                  }}
                />
              )),
            )}

            {/* Renderizar os corações */}
            {hearts.map((heart, index) => (
              <div
                key={`heart-${index}`}
                className="absolute flex items-center justify-center"
                style={{
                  left: heart.x * cellSize,
                  top: heart.y * cellSize,
                  width: cellSize,
                  height: cellSize,
                }}
              >
                <Image 
                  src="/images/heart.png" 
                  alt="Coração" 
                  width={cellSize * 0.8} 
                  height={cellSize * 0.8} 
                  className="object-contain" 
                />
              </div>
            ))}

            {/* Renderizar o jogador */}
            <div
              className="absolute flex items-center justify-center"
              style={{
                left: playerPos.x * cellSize,
                top: playerPos.y * cellSize,
                width: cellSize,
                height: cellSize,
                zIndex: 10,
              }}
            >
              <Image 
                src="/images/player.png" 
                alt="Jogador" 
                width={cellSize * 0.8} 
                height={cellSize * 0.8} 
                className="object-contain" 
              />
            </div>

            {/* Renderizar o inimigo */}
            {!gameWon && (
              <div
                className="absolute flex items-center justify-center"
                style={{
                  left: enemyPos.x * cellSize,
                  top: enemyPos.y * cellSize,
                  width: cellSize,
                  height: cellSize,
                  zIndex: 5,
                }}
              >
                <Image 
                  src="/images/enemy.png" 
                  alt="Inimigo" 
                  width={cellSize * 0.8} 
                  height={cellSize * 0.8} 
                  className="object-contain" 
                />
              </div>
            )}
          </div>

          {/* Controles responsivos */}
          <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-6">
            <div className="col-start-2">
              <Button 
                onClick={() => movePlayer(0, -1)} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 
                         transform hover:scale-110 transition-all duration-300 border border-white/20"
                variant="outline"
              >
                <ArrowUp className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400" />
              </Button>
            </div>
            <div className="col-start-1 row-start-2">
              <Button 
                onClick={() => movePlayer(-1, 0)} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 
                         transform hover:scale-110 transition-all duration-300 border border-white/20"
                variant="outline"
              >
                <ArrowLeft className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400" />
              </Button>
            </div>
            <div className="col-start-3 row-start-2">
              <Button 
                onClick={() => movePlayer(1, 0)} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 
                         transform hover:scale-110 transition-all duration-300 border border-white/20"
                variant="outline"
              >
                <ArrowRight className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400" />
              </Button>
            </div>
            <div className="col-start-2 row-start-3">
              <Button 
                onClick={() => movePlayer(0, 1)} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 
                         transform hover:scale-110 transition-all duration-300 border border-white/20"
                variant="outline"
              >
                <ArrowDown className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Modal de Game Over com efeito de fade */}
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm 
                      animate-fadeIn z-50">
          <div className="text-center bg-gradient-to-b from-red-900/80 to-black/80 p-8 rounded-2xl 
                        border-2 border-red-500/50 shadow-2xl">
            <h2 className="text-red-500 text-4xl font-bold mb-6 animate-pulse">Game Over!</h2>
            <Button 
              onClick={restartGame} 
              className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 
                       text-xl py-4 px-8 rounded-full transform hover:scale-105 transition-all duration-300"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Vitória com animações melhoradas */}
      {gameWon && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md 
                      animate-fadeIn z-50">
          <div className="text-center bg-gradient-to-b from-amber-900/90 via-yellow-900/80 to-black/90 p-8 rounded-3xl 
                        border-2 border-yellow-500/50 shadow-2xl animate-slideUp
                        relative overflow-hidden">
            {/* Efeito de brilho girando */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent 
                          animate-shine pointer-events-none" />
            
            {/* Círculos decorativos animados */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-xl animate-pulse" />

            <div className="relative">
              {/* Imagem do tesouro com animação */}
              <div className="mb-6 w-40 h-40 mx-auto relative animate-bounce">
                <Image 
                  src="/images/treasure.jpeg" 
                  alt="Tesouro" 
                  width={160} 
                  height={160} 
                  className="object-contain rounded-2xl shadow-lg"
                />
              </div>

              {/* Título com animação de entrada */}
              <h2 className="text-yellow-400 text-4xl font-bold mb-8 animate-slideDown
                           drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                oi voce ganhou
                <br />
                <span className="text-amber-300 animate-fadeInSlow">uma recompensa com ela</span>
              </h2>

              <div className="flex flex-col gap-4">
                {/* Botão Resgatar com efeito hover elaborado */}
                <a 
                  href="https://wa.me/96981182114?text=oi%20vose%20ganho%20um%20vale%20sorvete%20ou%20so%20uma%20tarde%20qualquer%20mas%20vose%20ganho" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group overflow-hidden rounded-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-green-500 to-green-600 
                                group-hover:animate-shimmer" />
                  <div className="relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 
                                hover:to-green-700 text-xl py-4 px-8 rounded-full transform 
                                hover:scale-105 transition-all duration-300 text-white font-bold 
                                shadow-lg shadow-green-500/30">
                    Resgatar
                  </div>
                </a>

                {/* Botão Jogar Novamente com efeito hover */}
                <Button 
                  onClick={restartGame} 
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 
                           hover:to-yellow-700 text-xl py-4 px-8 rounded-full transform 
                           hover:scale-105 transition-all duration-300 shadow-lg 
                           shadow-yellow-500/30"
                >
                  Jogar Novamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

