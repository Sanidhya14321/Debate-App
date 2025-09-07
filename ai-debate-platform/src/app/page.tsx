"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { BrainCircuit, Flame, MessageSquareQuote, Users, Trophy, Zap, Lock, Globe } from "lucide-react"
import { toast } from "sonner"

export default function Home() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [debateTopic, setDebateTopic] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    setToken(localStorage.getItem("token"))
  }, [])

  const handleCreateDebate = async (privateDebate = false) => {
    if (!token) {
      router.push("/login")
      return
    }

    if (!debateTopic.trim()) {
      toast.error("Error", {
        description: "Please enter a debate topic",
      })
      return
    }

    setCreating(true)
    try {
      const endpoint = privateDebate ? "/debates/private" : "/debates"
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: debateTopic.trim(),
          isPrivate: privateDebate,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create debate.")
      }

      const data = await response.json()

      if (privateDebate && data.inviteCode) {
        toast.success("Private debate created!", {
          description: `Invite code: ${data.inviteCode}`,
          duration: 5000,
        })
      } else {
        toast.success("Debate created!", {
          description: "Redirecting to debate room...",
        })
      }

      router.push(`/debate-room/${data._id}`)
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleQuickStart = () => {
    if (!token) {
      router.push("/login")
      return
    }
    setShowCreateForm(true)
  }

  const features = [
    {
      icon: <BrainCircuit className="h-12 w-12 text-primary" />,
      title: "AI-Powered Analysis",
      description: "Advanced NLP models analyze argument structure, coherence, and logical consistency in real-time.",
    },
    {
      icon: <MessageSquareQuote className="h-12 w-12 text-accent" />,
      title: "Persuasiveness Scoring",
      description:
        "Sentiment analysis and rhetorical evaluation measure the impact and effectiveness of your arguments.",
    },
    {
      icon: <Flame className="h-12 w-12 text-secondary" />,
      title: "Real-time Engagement",
      description: "Live debate rooms with instant feedback and dynamic scoring based on argument quality.",
    },
    {
      icon: <Users className="h-12 w-12 text-primary" />,
      title: "Collaborative Platform",
      description: "Join debates with participants worldwide and learn from diverse perspectives.",
    },
    {
      icon: <Trophy className="h-12 w-12 text-accent" />,
      title: "Competitive Rankings",
      description: "Track your progress with detailed analytics and compete in leaderboards.",
    },
    {
      icon: <Zap className="h-12 w-12 text-secondary" />,
      title: "Instant Results",
      description: "Get immediate AI-generated feedback with detailed breakdowns of your performance.",
    },
  ]

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navigation />

      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 mb-24">
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  AI-Powered
                </span>
                <br />
                Debate Platform
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl lg:text-2xl text-pretty">
                Master the art of argumentation with intelligent AI judging, real-time analysis, and competitive debate
                scoring. Elevate your persuasive skills today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button onClick={handleQuickStart} size="lg" className="text-lg px-8 py-6 animate-pulse-glow">
                <BrainCircuit className="mr-2 h-5 w-5" />
                Start Debating
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/debate-lobby")}
                className="text-lg px-8 py-6"
              >
                <Users className="mr-2 h-5 w-5" />
                Join Community
              </Button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse" />
              <img
                src="/ai-brain-with-debate-symbols-and-scales-of-justice.jpg"
                alt="AI Debate Platform Illustration"
                width={500}
                height={500}
                className="relative rounded-2xl shadow-2xl animate-float"
              />
            </div>
          </div>
        </section>

        {showCreateForm && (
          <section className="mb-16">
            <Card className="max-w-2xl mx-auto border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Create New Debate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="topic">Debate Topic</Label>
                  <Textarea
                    id="topic"
                    placeholder="Enter your debate topic (e.g., 'Should artificial intelligence be regulated by governments?')"
                    value={debateTopic}
                    onChange={(e) => setDebateTopic(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleCreateDebate(false)}
                    disabled={creating || !debateTopic.trim()}
                    className="gap-2 h-16"
                    size="lg"
                  >
                    <Globe className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Public Debate</div>
                      <div className="text-xs opacity-90">Anyone can join</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleCreateDebate(true)}
                    disabled={creating || !debateTopic.trim()}
                    variant="outline"
                    className="gap-2 h-16"
                    size="lg"
                  >
                    <Lock className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Private Debate</div>
                      <div className="text-xs opacity-90">Invite code required</div>
                    </div>
                  </Button>
                </div>

                <div className="flex justify-center">
                  <Button variant="ghost" onClick={() => setShowCreateForm(false)} disabled={creating}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Features Section */}
        <section className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
              Intelligent Debate Analysis
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
              Our advanced AI system evaluates every aspect of your debate performance, providing detailed insights to
              help you become a master debater.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-br from-card to-muted group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-pretty">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-card to-muted border-2 border-primary/20">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold mb-4">Ready to Begin Your Debate Journey?</h3>
              <p className="text-lg text-muted-foreground mb-8 text-pretty">
                Join thousands of debaters improving their skills with AI-powered feedback and analysis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleQuickStart} className="px-8">
                  Create Your First Debate
                </Button>
                <Button variant="outline" size="lg" onClick={() => router.push("/debate-lobby")}>
                  Explore Active Debates
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
