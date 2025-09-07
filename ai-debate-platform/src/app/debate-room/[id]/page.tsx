"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { DebateTimer } from "@/components/debate-timer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Navigation } from "@/components/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { Badge } from "@/components/ui/badge"
import { User, Bot, Send, Trophy, Copy, Users } from "lucide-react"
import { toast } from "sonner"

export default function DebateRoomPage() {
  const router = useRouter()
  const params = useParams()
  const debateId = params.id as string
  const [allArguments, setAllArguments] = useState<any[]>([]) // Store all arguments
  const [currentArg, setCurrentArg] = useState("")
  const [isDebateOver, setIsDebateOver] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [debateInfo, setDebateInfo] = useState<any>(null) // Store debate info
  const [currentUser, setCurrentUser] = useState<string>("")

  const userArguments = allArguments.filter((arg) => arg.username === currentUser)
  const opponentArguments = allArguments.filter((arg) => arg.username !== currentUser)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (!storedToken) {
      router.push("/login")
      return
    }
    setToken(storedToken)

    try {
      const payload = JSON.parse(atob(storedToken.split(".")[1]))
      setCurrentUser(payload.username)
    } catch (error) {
      console.error("Token decode error:", error)
    }

    if (!debateId || debateId === "undefined") {
      router.push("/debate-lobby")
      return
    }

    // Join debate room
    fetch(`http://localhost:5000/debates/${debateId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedToken}`,
      },
    })

    const interval = setInterval(async () => {
      try {
        // Get debate status
        const statusRes = await fetch(`http://localhost:5000/debates/${debateId}/status`)
        if (statusRes.ok) {
          const statusData = await statusRes.json()
          setDebateInfo(statusData)

          // If debate is active, also fetch arguments
          if (statusData.status === "active") {
            const argsRes = await fetch(`http://localhost:5000/debates/${debateId}/arguments`)
            if (argsRes.ok) {
              const argsData = await argsRes.json()
              setAllArguments(argsData)
            }
          }
        }
      } catch (error) {
        console.error("Polling error:", error)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [debateId, router])

  const copyInviteCode = () => {
    if (debateInfo?.inviteCode) {
      navigator.clipboard.writeText(debateInfo.inviteCode)
      toast.success("Invite code copied!", {
        description: "Share this code with others to join the private debate.",
      })
    }
  }

  const handleEndDebate = async () => {
    if (!token) return
    try {
      const response = await fetch(`http://localhost:5000/debates/${debateId}/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to finalize debate.")
      }
      router.push(`/results/${debateId}`)
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      })
    }
  }

  const handleSubmitArgument = async () => {
    if (currentArg.trim() && token) {
      try {
        const response = await fetch(`http://localhost:5000/debates/${debateId}/arguments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ argumentText: currentArg.trim() }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to submit argument.")
        }

        setCurrentArg("")

        toast.success("Argument submitted", {
          description: "Your argument has been analyzed by AI.",
        })

        const argsRes = await fetch(`http://localhost:5000/debates/${debateId}/arguments`)
        if (argsRes.ok) {
          const argsData = await argsRes.json()
          setAllArguments(argsData)
        }
      } catch (error) {
        console.log("[v0] Argument submission error:", error)
        toast.error("Error", {
          description: error instanceof Error ? error.message : "An unknown error occurred.",
        })
      }
    }
  }

  if (!debateInfo || debateInfo.status === "waiting") {
    return (
      <div className="min-h-screen">
        <AnimatedBackground />
        <Navigation />

        <main className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Debate Lobby
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">Waiting for participants to join</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-8">
            <Card className="max-w-lg w-full">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Users className="h-6 w-6" />
                  {debateInfo?.topic || "Loading..."}
                </CardTitle>
                {debateInfo?.isPrivate && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Badge variant="secondary">Private Debate</Badge>
                    <Button variant="outline" size="sm" onClick={copyInviteCode} className="gap-2 bg-transparent">
                      <Copy className="h-3 w-3" />
                      {debateInfo.inviteCode}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground">Participants joined:</p>
                  <div className="space-y-2">
                    {debateInfo?.joinedUsers?.map((user: string, index: number) => (
                      <div key={user} className="flex items-center justify-center gap-2 p-2 bg-muted rounded-lg">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{user}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary" />
                  <p className="text-muted-foreground">
                    {!debateInfo?.joinedUsers?.length
                      ? "Connecting to debate room..."
                      : `Waiting for ${2 - debateInfo.joinedUsers.length} more participant(s)...`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Live Debate Arena
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">{debateInfo?.topic}</p>
          {debateInfo?.isPrivate && (
            <Badge variant="secondary" className="mt-2">
              Private Debate
            </Badge>
          )}
        </div>

        <div className="space-y-8">
          <Card className="mx-auto max-w-6xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-4">
                <DebateTimer durationInSeconds={300} onTimeUp={() => setIsDebateOver(true)} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Your Arguments */}
                <div className="space-y-6">
                  <h3 className="flex items-center justify-center gap-2 text-xl font-semibold text-primary">
                    <User className="h-5 w-5" />
                    Your Arguments ({userArguments.length})
                  </h3>

                  <ScrollArea className="h-64 rounded-lg border-2 border-primary/20 p-4 bg-card/50">
                    <div className="space-y-3">
                      {userArguments.map((arg, i) => (
                        <div key={i} className="p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
                          <p className="text-sm leading-relaxed">{arg.argument}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(arg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                      {userArguments.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No arguments submitted yet. Start the debate!
                        </p>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="space-y-4">
                    <Textarea
                      placeholder="Present your argument with evidence and reasoning..."
                      value={currentArg}
                      onChange={(e) => setCurrentArg(e.target.value)}
                      disabled={isDebateOver}
                      rows={4}
                      className="resize-none"
                    />
                    <Button
                      onClick={handleSubmitArgument}
                      disabled={isDebateOver || !currentArg.trim()}
                      className="w-full"
                      size="lg"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Submit Argument
                    </Button>
                  </div>
                </div>

                {/* Opponent's Arguments */}
                <div className="space-y-6">
                  <h3 className="flex items-center justify-center gap-2 text-xl font-semibold text-accent">
                    <Bot className="h-5 w-5" />
                    Opponent's Arguments ({opponentArguments.length})
                  </h3>

                  <ScrollArea className="h-64 rounded-lg border-2 border-accent/20 p-4 bg-card/50">
                    <div className="space-y-3">
                      {opponentArguments.map((arg, i) => (
                        <div key={i} className="p-3 bg-accent/10 rounded-lg border-l-4 border-accent">
                          <p className="text-sm leading-relaxed">{arg.argument}</p>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-muted-foreground">{arg.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(arg.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {opponentArguments.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Waiting for opponent's arguments...
                        </p>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="h-[124px] flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
                    <p className="text-muted-foreground">
                      {opponentArguments.length > 0
                        ? "Opponent is preparing their next argument..."
                        : "Waiting for opponent to start..."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={handleEndDebate} size="lg" className="px-8 py-6 text-lg animate-pulse-glow">
              <Trophy className="mr-2 h-5 w-5" />
              End Debate & See AI Results
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
