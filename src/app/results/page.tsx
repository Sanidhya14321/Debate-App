import { Suspense } from 'react';
import { ResultsDisplay } from './results-display';

export default function ResultsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense fallback={<LoadingSkeleton />}>
        <ResultsDisplay />
      </Suspense>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-10 text-center">
        <div className="mx-auto h-12 w-3/4 rounded-md bg-muted"></div>
        <div className="mx-auto mt-4 h-6 w-1/2 rounded-md bg-muted"></div>
      </div>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="h-40 w-full rounded-lg bg-muted"></div>
        <div className="h-64 w-full rounded-lg bg-muted"></div>
      </div>
    </div>
  );
}
