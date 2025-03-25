import ClientMazeGame from "@/components/client-maze-game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900">
      <ClientMazeGame />
    </main>
  )
}

