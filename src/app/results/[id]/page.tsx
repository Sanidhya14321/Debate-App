'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface Score {
  name: string;
  score: number;
}

interface ResultsData {
    winner: string;
    scores: {
        debaterA: Score[];
        debaterB: Score[];
    };
    feedback: {
        summary: string;
        suggestions: string;
    };
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const debateId = params.id as string;

  const [results, setResults] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!debateId) return;

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:4000/debates/${debateId}/results`);
        
        if (response.status === 404) {
            setError("Results not ready. The debate may still be in progress.");
            setIsLoading(false);
            return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch debate results.');
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debateId]);


  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Generating Your Results...</h1>
            <p className="mt-3 text-lg text-muted-foreground">The AI Judge is analyzing the debate.</p>
            <div className="mt-8 flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
            </div>
        </div>
    );
  }

  if (error) {
    return (
       <div className="container mx-auto flex flex-col items-center justify-center gap-4 py-12">
        <Alert variant="destructive" className="max-w-md">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
         <Button asChild>
            <Link href="/">Start New Debate</Link>
        </Button>
      </div>
    );
  }

  if (!results) {
     return (
       <div className="container mx-auto flex flex-col items-center justify-center gap-4 text-center py-12">
            <h2 className="text-2xl font-semibold">No results data found.</h2>
            <Button asChild size="lg">
                <Link href="/">Start a New Debate</Link>
            </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-12 px-4 py-12">
        <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">And the winner is...</p>
            <h1 className="text-5xl font-bold tracking-tight text-primary sm:text-6xl">{results.winner}!</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <ScoreCard title="Debater A Scores" scores={results.scores.debaterA} />
            <ScoreCard title="Debater B Scores" scores={results.scores.debaterB} />
        </div>

        {results.feedback && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">AI Judge's Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-accent">Debate Summary</h3>
                        <p className="mt-2 text-muted-foreground">{results.feedback.summary}</p>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-accent">Suggestions for Improvement</h3>
                        <p className="mt-2 text-muted-foreground">{results.feedback.suggestions}</p>
                    </div>
                </CardContent>
            </Card>
        )}

         <div className="flex justify-center">
            <Button asChild size="lg">
                <Link href="/">Start New Debate</Link>
            </Button>
        </div>
    </div>
  );
}


function ScoreCard({ title, scores }: { title: string; scores: Score[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-center text-2xl text-accent">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {scores.map((item) => (
                    <div key={item.name}>
                        <div className="mb-2 flex justify-between">
                            <span className="font-medium">{item.name}</span>
                            <span className="font-semibold text-primary">{item.score}</span>
                        </div>
                        <Progress value={item.score} className="h-3" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
