"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebateLobby() {
  const [openDebates, setOpenDebates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:5000/debates/open")
      .then((res) => res.json())
      .then((data) => {
        setOpenDebates(data);
        setLoading(false);
      });
  }, []);

  const handleJoin = (debateId: string) => {
    router.push(`/debate-room/${debateId}`);
  };

  const handleCreate = () => {
    router.push("/"); // Home page creates a new debate
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Join a Debate</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading open debates...</p>
          ) : openDebates.length === 0 ? (
            <div className="text-center">
              <p className="mb-4">No open debates found.</p>
              <Button onClick={handleCreate}>Create New Debate</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {openDebates.map((debate) => (
                <Card key={debate._id} className="border shadow">
                  <CardContent className="flex items-center justify-between">
                    <span className="font-semibold">{debate.topic || "Untitled Debate"}</span>
                    <Button onClick={() => handleJoin(debate._id)}>Join</Button>
                  </CardContent>
                </Card>
              ))}
              <div className="text-center mt-6">
                <Button onClick={handleCreate}>Create New Debate</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
