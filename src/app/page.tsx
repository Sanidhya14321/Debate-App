import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Flame, MessageSquareQuote } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: <BrainCircuit className="h-10 w-10 text-primary" />,
      title: 'Logical Consistency',
      description: 'NLP models analyze the structure of your arguments for coherence and validity.',
    },
    {
      icon: <MessageSquareQuote className="h-10 w-10 text-primary" />,
      title: 'Persuasiveness',
      description: 'Sentiment and emotion detection algorithms measure the impact of your rhetoric.',
    },
    {
      icon: <Flame className="h-10 w-10 text-primary" />,
      title: 'Engagement',
      description: 'Scoring is based on the strength, frequency, and relevance of your arguments.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <section className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="space-y-6 text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl">
            AI-Powered Debate Judge
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            Debate. Compete. Get AI-Scored Feedback. Sharpen your arguments and
            master the art of persuasion with instant, data-driven insights.
          </p>
          <Button asChild size="lg" className="shadow-lg shadow-primary/20">
            <Link href="/debate-room">Start a Debate</Link>
          </Button>
        </div>
        <div className="flex justify-center">
          <Image
            src="https://picsum.photos/600/600"
            alt="AI Debate Judge"
            width={600}
            height={600}
            data-ai-hint="justice scales"
            className="rounded-full object-cover shadow-2xl"
          />
        </div>
      </section>

      <section className="mt-24 py-16 sm:mt-32">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How You're Judged
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our advanced AI analyzes every aspect of your performance.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader className="items-center">
                {feature.icon}
                <CardTitle className="mt-4 text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
