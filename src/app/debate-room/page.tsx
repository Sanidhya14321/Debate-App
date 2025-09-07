import { DebateForm } from './debate-form';

export default function DebateRoomPage() {
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
      <DebateForm />
    </div>
  );
}
