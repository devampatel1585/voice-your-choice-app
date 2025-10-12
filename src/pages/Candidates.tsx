import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";

const candidates = [
  {
    id: 1,
    name: "Ethan Harper",
    tagline: "Dedicated to improving campus life.",
    avatar: "EH",
  },
  {
    id: 2,
    name: "Olivia Bennett",
    tagline: "Focus on academic support & resources.",
    avatar: "OB",
  },
  {
    id: 3,
    name: "Noah Carter",
    tagline: "Advocating for student mental health.",
    avatar: "NC",
  },
  {
    id: 4,
    name: "Ava Thompson",
    tagline: "Committed to diversity and inclusion.",
    avatar: "AT",
  },
];

const Candidates = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCandidates = candidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              B.Tech 3rd Year Election
            </h1>
            <p className="text-lg text-muted-foreground">
              Vote for your representative. Click on a candidate to see their profile.
            </p>
          </div>

          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for a candidate by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          <div className="grid gap-6">
            {filteredCandidates.map((candidate) => (
              <Card
                key={candidate.id}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50"
              >
                <Link to={`/candidate/${candidate.id}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                        {candidate.avatar}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl">{candidate.name}</CardTitle>
                        <CardDescription className="text-base mt-1">
                          {candidate.tagline}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      View Profile
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground mt-12">
        © 2024 Voice Your Choice. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Candidates;
