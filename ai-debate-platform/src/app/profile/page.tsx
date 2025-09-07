"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { User, Trophy, MessageSquare, Target, TrendingUp, LogOut } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchProfile(token)
  }, [router])

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5000/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        throw new Error("Failed to fetch profile")
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to load profile data",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <AnimatedBackground />
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary" />
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
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Your Profile</span>
          </h1>
          <p className="text-lg text-muted-foreground">Track your debate performance and achievements</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{profile?.user?.username}</h2>
                  <p className="text-muted-foreground">{profile?.user?.email}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <Badge variant="secondary" className="gap-2">
                    <Trophy className="h-3 w-3" />
                    Debater
                  </Badge>
                  <Badge variant="outline" className="gap-2">
                    <TrendingUp className="h-3 w-3" />
                    {profile?.stats?.winRate}% Win Rate
                  </Badge>
                </div>
                <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Total Debates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{profile?.stats?.totalDebates || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Debates participated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Wins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{profile?.stats?.wins || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Debates won</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Arguments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{profile?.stats?.totalArguments || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Arguments submitted</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{profile?.stats?.winRate || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">Success rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Debate Activity</h4>
                    <p className="text-sm text-muted-foreground">
                      {profile?.stats?.totalDebates > 0
                        ? "You're actively participating in debates!"
                        : "Start your first debate to see insights here."}
                    </p>
                  </div>
                  <Badge variant={profile?.stats?.totalDebates > 5 ? "default" : "secondary"}>
                    {profile?.stats?.totalDebates > 5 ? "Active" : "Getting Started"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Argument Quality</h4>
                    <p className="text-sm text-muted-foreground">
                      Average arguments per debate:{" "}
                      {profile?.stats?.totalDebates > 0
                        ? Math.round((profile?.stats?.totalArguments || 0) / profile?.stats?.totalDebates)
                        : 0}
                    </p>
                  </div>
                  <Badge variant="outline">{profile?.stats?.totalArguments > 10 ? "Detailed" : "Developing"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => router.push("/debate-lobby")} className="gap-2">
                  <Target className="h-4 w-4" />
                  Join Debate
                </Button>
                <Button variant="outline" onClick={() => router.push("/")} className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Create Debate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
