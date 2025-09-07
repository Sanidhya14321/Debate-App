"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, MessageSquare, Plus, Lock, Key } from "lucide-react"
import { toast } from "sonner"

interface Debate {
  _id: string
  topic: string
  createdAt: string
  joinedUsers: string[]
  isPrivate?: boolean
}

export default function DebateLobby() {
  const [openDebates, setOpenDebates] = useState<Debate[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteCode, setInviteCode] = useState("")
  const [joiningPrivate, setJoiningPrivate] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchOpenDebates()
  }, [])

  const fetchOpenDebates = async () => {
    try {
      const response = await fetch("http://localhost:5000/debates/open")
      const data = await response.json()
      setOpenDebates(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch debates:", error)
      setOpenDebates([])
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = (debateId: string) => {
    router.push(`/debate-room/${debateId}`)
  }

  const handleCreate = () => {
    router.push("/")
  }

  const handleJoinPrivate = async () => {
    if (!inviteCode.trim()) {
      toast.error("Error", {
        description: "Please enter an invite code",
      })
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    setJoiningPrivate(true)
    try {
      const response = await fetch("http://localhost:5000/debates/join-private", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("Joined private debate!", {
          description: "Redirecting to debate room...",
        })
        router.push(`/debate-room/${data.debate._id}`)
      } else {
        const error = await response.json()
        toast.error("Error", {
          description: error.message || "Failed to join private debate",
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "Network error. Please try again.",
      })
    } finally {
      setJoiningPrivate(false)
    }
  }

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Debate Lobby</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join an active debate or create your own. Connect with debaters worldwide and test your argumentation
            skills.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-8 bg-gradient-to-r from-accent/5 to-primary/5 border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-accent" />
                Join Private Debate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="invite-code">Invite Code</Label>
                  <Input
                    id="invite-code"
                    placeholder="Enter 6-character code (e.g., ABC123)"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleJoinPrivate} disabled={joiningPrivate || !inviteCode.trim()} className="gap-2">
                  <Key className="h-4 w-4" />
                  {joiningPrivate ? "Joining..." : "Join"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Loading debates...</span>
              </CardContent>
            </Card>
          ) : openDebates.length === 0 ? (
            <Card className="text-center">
              <CardContent className="py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Active Public Debates</h3>
                <p className="text-muted-foreground mb-6">Be the first to start a debate and invite others to join!</p>
                <Button onClick={handleCreate} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Debate
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openDebates.map((debate) => (
                  <Card
                    key={debate._id}
                    className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2 flex items-start justify-between">
                        <span>{debate.topic || "Untitled Debate"}</span>
                        {debate.isPrivate && (
                          <Badge variant="secondary" className="ml-2 gap-1">
                            <Lock className="h-3 w-3" />
                            Private
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{debate.joinedUsers?.length || 0}/2 joined</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{new Date(debate.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleJoin(debate._id)}
                          className="w-full"
                          variant={debate.joinedUsers?.length >= 1 ? "default" : "outline"}
                        >
                          {debate.joinedUsers?.length >= 1 ? "Join Debate" : "Be First to Join"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-gradient-to-r from-card to-muted border-2 border-primary/20">
                <CardContent className="text-center py-8">
                  <h3 className="text-xl font-semibold mb-2">Start Your Own Debate</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a new debate room and set the topic for discussion.
                  </p>
                  <Button onClick={handleCreate} size="lg" variant="outline">
                    <Plus className="mr-2 h-5 w-5" />
                    Create New Debate
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
