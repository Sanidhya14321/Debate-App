'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { DebateTimer } from '@/components/debate-timer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Bot } from 'lucide-react';

export function DebateForm() {
  const router = useRouter();
  const [debaterAArgs, setDebaterAArgs] = useState<string[]>([]);
  const [debaterBArgs, setDebaterBArgs] = useState<string[]>([]);
  const [currentArgA, setCurrentArgA] = useState('');
  const [currentArgB, setCurrentArgB] = useState('');
  const [isDebateOver, setIsDebateOver] = useState(false);

  const handleEndDebate = () => {
    const query = new URLSearchParams({
      debaterAArgs: JSON.stringify(debaterAArgs),
      debaterBArgs: JSON.stringify(debaterBArgs),
    });
    router.push(`/results?${query.toString()}`);
  };

  const handleSubmitArgument = (debater: 'A' | 'B') => {
    if (debater === 'A' && currentArgA.trim()) {
      setDebaterAArgs((prev) => [...prev, currentArgA.trim()]);
      setCurrentArgA('');
    } else if (debater === 'B' && currentArgB.trim()) {
      setDebaterBArgs((prev) => [...prev, currentArgB.trim()]);
      setCurrentArgB('');
    }
  };

  return (
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
                <User /> Debater A
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
                value={currentArgA}
                onChange={(e) => setCurrentArgA(e.target.value)}
                disabled={isDebateOver}
                rows={4}
              />
              <Button
                onClick={() => handleSubmitArgument('A')}
                disabled={isDebateOver || !currentArgA.trim()}
                className="w-full"
              >
                Submit Argument
              </Button>
            </div>

            {/* Debater B */}
            <div className="space-y-4">
              <h3 className="flex items-center justify-center gap-2 text-xl font-semibold text-accent">
                <Bot /> Debater B
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
                      No arguments submitted yet.
                    </p>
                  )}
                </div>
              </ScrollArea>
              <Textarea
                placeholder="Type your argument..."
                value={currentArgB}
                onChange={(e) => setCurrentArgB(e.target.value)}
                disabled={isDebateOver}
                rows={4}
              />
              <Button
                onClick={() => handleSubmitArgument('B')}
                disabled={isDebateOver || !currentArgB.trim()}
                className="w-full"
              >
                Submit Argument
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-8 flex justify-center">
        <Button
          onClick={handleEndDebate}
          size="lg"
          className="shadow-lg shadow-primary/20"
          disabled={debaterAArgs.length === 0 && debaterBArgs.length === 0}
        >
          End Debate & See Results
        </Button>
      </div>
    </div>
  );
}
