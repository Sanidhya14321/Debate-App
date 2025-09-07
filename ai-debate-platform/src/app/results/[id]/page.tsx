"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { Trophy, Brain, MessageSquare, Flame, Home, RotateCcw } from "lucide-react"

interface DebateResult {
  logicScore: number
  persuasivenessScore: number
  engagementScore: number
  winner: string
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const debateId = params.id as string
  const [results, setResults] = useState<DebateResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!debateId) {
      router.push("/")
      return
    }

    fetchResults()
  }, [debateId, router])

  const fetchResults = async () => {
    try {
      const response = await fetch(`http://localhost:5000/debates/${debateId}/results`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      } else {
        console.error("Failed to fetch results")
      }
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-500"
    if (score >= 0.6) return "text-yellow-500"
    return "text-red-500"
  }

  const getProgressColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500"
    if (score >= 0.6) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <AnimatedBackground />
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
              <span className="text-muted-foreground">Analyzing debate results...</span>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen">
        <AnimatedBackground />
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="py-12">
              <h2 className="text-2xl font-bold mb-4">Results Not Available</h2>
              <p className="text-muted-foreground mb-6">
                The debate results could not be loaded. This might happen if the debate wasn't properly finalized.
              </p>
              <Button onClick={() => router.push("/")}>
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const scores = [
    {
      label: "Logical Consistency",
      value: results.logicScore,
      icon: <Brain className="h-5 w-5" />,
      description: "Structure and coherence of arguments",
    },
    {
      label: "Persuasiveness",
      value: results.persuasivenessScore,
      icon: <MessageSquare className="h-5 w-5" />,
      description: "Emotional impact and rhetorical effectiveness",
    },
    {
      label: "Engagement",
      value: results.engagementScore,
      icon: <Flame className="h-5 w-5" />,
      description: "Quality and frequency of contributions",
    },
  ]

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Debate Results
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">AI-powered analysis of your debate performance</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Winner Announcement */}
          <Card className="text-center bg-gradient-to-r from-card to-muted border-2 border-primary/20">
            <CardContent className="py-12">
              <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">
                {results.winner === "A"
                  ? "Congratulations! You Won!"
                  : results.winner === "B"
                    ? "Your Opponent Won"
                    : "It's a Tie!"}
              </h2>
              <p className="text-muted-foreground">
                {results.winner === "A"
                  ? "Your arguments were more compelling according to AI analysis"
                  : results.winner === "B"
                    ? "Your opponent presented stronger arguments"
                    : "Both debaters performed equally well"}
              </p>
            </CardContent>
          </Card>

          {/* Detailed Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scores.map((score, index) => (
              <Card key={score.label} className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-2 p-3 rounded-full bg-primary/10">{score.icon}</div>
                  <CardTitle className="text-lg">{score.label}</CardTitle>
                  <p className="text-sm text-muted-foreground">{score.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <span className={`text-3xl font-bold ${getScoreColor(score.value)}`}>
                      {Math.round(score.value * 100)}%
                    </span>
                  </div>
                  <Progress value={score.value * 100} className="h-3" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Overall Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Overall Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {Math.round(((results.logicScore + results.persuasivenessScore + results.engagementScore) / 3) * 100)}
                  %
                </div>
                <p className="text-muted-foreground">Average Score</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Strengths</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {results.logicScore >= 0.7 && <li>• Strong logical structure</li>}
                    {results.persuasivenessScore >= 0.7 && <li>• Compelling arguments</li>}
                    {results.engagementScore >= 0.7 && <li>• High engagement level</li>}
                    {Math.max(results.logicScore, results.persuasivenessScore, results.engagementScore) < 0.7 && (
                      <li>• Room for improvement in all areas</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600">Areas for Improvement</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {results.logicScore < 0.7 && <li>• Work on argument structure</li>}
                    {results.persuasivenessScore < 0.7 && <li>• Enhance persuasive techniques</li>}
                    {results.engagementScore < 0.7 && <li>• Increase participation level</li>}
                    {Math.min(results.logicScore, results.persuasivenessScore, results.engagementScore) >= 0.7 && (
                      <li>• Maintain excellent performance</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.push("/debate-lobby")} size="lg">
              <RotateCcw className="mr-2 h-5 w-5" />
              Debate Again
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} size="lg">
              <Home className="mr-2 h-5 w-5" />
              Return Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
