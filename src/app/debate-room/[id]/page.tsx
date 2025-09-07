'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { DebateTimer } from '@/components/debate-timer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DebateRoomPage() {
  const router = useRouter();
  const params = useParams();
  const debateId = params.id as string;
  const { toast } = useToast();

  const [debaterAArgs, setDebaterAArgs] = useState<string[]>([]);
  const [debaterBArgs, setDebaterBArgs] = useState<string[]>([]);
  const [currentArg, setCurrentArg] = useState('');
  const [isDebateOver, setIsDebateOver] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const handleEndDebate = async () => {
    if (!token) return;
    try {
       const response = await fetch(`http://localhost:4000/debates/${debateId}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
       if (!response.ok) {
        throw new Error('Failed to finalize debate.');
      }
      router.push(`/results/${debateId}`);
    } catch(error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
    }
  };

  const handleSubmitArgument = async () => {
    if (currentArg.trim() && token) {
      try {
        const response = await fetch(`http://localhost:4000/debates/${debateId}/arguments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ argument: currentArg.trim() }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit argument.');
        }
        
        // Mocking argument display for now. A real implementation might use WebSockets.
        setDebaterAArgs((prev) => [...prev, currentArg.trim()]);
        setCurrentArg('');

      } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
       <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Live Debate
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Two participants, one AI judge. Let the debate begin.
        </p>
      </div>
      <div className="mt-10">
      <Card className="mx-auto max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            <DebateTimer
              durationInSeconds={300}
              onTimeUp={() => setIsDebateOver(true)}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Debater A */}
            <div className="space-y-4">
              <h3 className="flex items-center justify-center gap-2 text-xl font-semibold text-accent">
                <User /> Your Arguments
              </h3>
              <ScrollArea className="h-48 rounded-md border p-4">
                <div className="space-y-2">
                  {debaterAArgs.map((arg, i) => (
                    <p key={i} className="text-sm">
                      {arg}
                    </p>
                  ))}
                  {debaterAArgs.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No arguments submitted yet.
                    </p>
                  )}
                </div>
              </ScrollArea>
               <Textarea
                placeholder="Type your argument..."
                value={currentArg}
                onChange={(e) => setCurrentArg(e.target.value)}
                disabled={isDebateOver}
                rows={4}
              />
              <Button
                onClick={handleSubmitArgument}
                disabled={isDebateOver || !currentArg.trim()}
                className="w-full"
              >
                Submit Argument
              </Button>
            </div>

            {/* Debater B */}
            <div className="space-y-4">
              <h3 className="flex items-center justify-center gap-2 text-xl font-semibold text-accent">
                <Bot /> Opponent's Arguments
              </h3>
              <ScrollArea className="h-48 rounded-md border p-4">
                <div className="space-y-2">
                  {debaterBArgs.map((arg, i) => (
                    <p key={i} className="text-sm">
                      {arg}
                    </p>
                  ))}
                   {debaterBArgs.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Opponent has not submitted arguments.
                    </p>
                  )}
                </div>
              </ScrollArea>
              <div className='h-[124px] flex items-center justify-center'>
                 <p className="text-muted-foreground">Waiting for opponent...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-8 flex justify-center">
        <Button
          onClick={handleEndDebate}
          size="lg"
          className="shadow-lg shadow-primary/20"
        >
          End Debate & See Results
        </Button>
      </div>
    </div>
    </div>
  );
}
