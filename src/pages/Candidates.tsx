import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCandidates } from "@/hooks/useCandidates";
import { useAuth } from "@/contexts/AuthContext";

const Candidates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { candidates, loading } = useCandidates();
  const { user } = useAuth();

  const filteredCandidates = candidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent px-4">
              B.Tech 3rd Year Election
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground px-4">
              Vote for your representative. Click on a candidate to see their profile.
            </p>
            {!user && (
              <p className="text-sm text-primary mt-2">
                <Link to="/login" className="underline hover:text-primary/80">Sign in</Link> to vote for your favorite candidate.
              </p>
            )}
          </div>

          <div className="relative mb-6 sm:mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              placeholder="Search for a candidate by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No candidates found matching your search.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {filteredCandidates.map((candidate) => (
                <Card
                  key={candidate.id}
                  className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50"
                >
                  <Link to={`/candidate/${candidate.id}`}>
                    <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 ring-2 ring-primary/20">
                          <AvatarImage src={candidate.avatar} alt={candidate.name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-base sm:text-xl">
                            {candidate.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg sm:text-xl md:text-2xl truncate">{candidate.name}</CardTitle>
                          <CardDescription className="text-sm sm:text-base mt-1 line-clamp-2">
                            {candidate.tagline}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                      <Button variant="outline" className="w-full text-sm sm:text-base h-9 sm:h-10">
                        View Profile
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground mt-8 sm:mt-12">
        © 2024 Voice Your Choice. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Candidates;