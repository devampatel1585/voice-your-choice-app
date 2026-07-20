import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, LogIn, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import ClassTokenGate from "@/components/ClassTokenGate";
import { useCandidates } from "@/hooks/useCandidates";
import { useAuth } from "@/contexts/AuthContext";
import { useClassAccess } from "@/hooks/useClassAccess";

const Results = () => {
  const { user, loading: authLoading } = useAuth();
  const { classInfo, loading: classLoading, clearClass } = useClassAccess();
  const { candidates, loading } = useCandidates(classInfo?.id ?? null);

  if (authLoading || classLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12 sm:py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">Sign in to view results</h1>
            <Button asChild size="lg" className="h-12 px-8"><Link to="/login">Sign in</Link></Button>
          </div>
        </main>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <ClassTokenGate title="Enter class token to view results" description="Results are scoped to a single class. Enter the class token to view its results." />
        </main>
      </div>
    );
  }

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
  const resultsData = candidates.map((candidate) => ({
    ...candidate,
    percentage: totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0,
  })).sort((a, b) => b.votes - a.votes);
  const winner = resultsData[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4">Election Results</h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">{classInfo.name}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-2">Token: <span className="font-mono">{classInfo.token}</span></p>
            <p className="text-sm text-muted-foreground mt-2">Total votes cast: {totalVotes}</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={clearClass}><X className="h-4 w-4 mr-1" /> Switch class</Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
          ) : (
            <>
              {winner && totalVotes > 0 && (
                <Card className="mb-8 sm:mb-12 border-2 border-success bg-gradient-to-br from-success/5 to-transparent">
                  <CardHeader className="text-center pb-4 sm:pb-6 p-4 sm:p-6">
                    <div className="flex justify-center mb-3 sm:mb-4">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-success to-secondary flex items-center justify-center">
                        <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl mb-2">Winner</CardTitle>
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mx-auto mb-3 ring-4 ring-success/50">
                      <AvatarImage src={winner.avatar} alt={winner.name} />
                      <AvatarFallback className="bg-gradient-to-br from-success to-secondary text-white font-bold text-2xl">
                        {winner.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <CardDescription className="text-lg sm:text-xl font-semibold text-foreground">{winner.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-2 p-4 pt-0 sm:p-6 sm:pt-0">
                    <p className="text-base sm:text-lg font-medium">Elected with <span className="text-success font-bold">{winner.votes.toLocaleString()} votes</span></p>
                    <p className="text-sm sm:text-base text-muted-foreground">Secured {winner.percentage}% of the total votes.</p>
                  </CardContent>
                </Card>
              )}
              {totalVotes === 0 && (
                <Card className="mb-8 sm:mb-12 text-center py-10"><CardContent><p className="text-muted-foreground">No votes have been cast yet.</p></CardContent></Card>
              )}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-2"><Medal className="h-5 w-5 text-primary" /> Vote Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 pt-0 sm:p-6 sm:pt-0">
                  {resultsData.map((candidate, index) => (
                    <div key={candidate.id} className="space-y-2">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                        <Avatar className={`h-10 w-10 sm:h-12 sm:w-12 ${index === 0 && totalVotes > 0 ? "ring-2 ring-success" : ""}`}>
                          <AvatarImage src={candidate.avatar} alt={candidate.name} />
                          <AvatarFallback className={`${index === 0 && totalVotes > 0 ? "bg-gradient-to-br from-success to-secondary" : "bg-gradient-to-br from-primary to-accent"} text-white font-bold text-sm sm:text-base`}>
                            {candidate.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-2 mb-1">
                            <p className="font-semibold text-base sm:text-lg truncate">{candidate.name}</p>
                            <div className="flex items-baseline gap-1 sm:gap-2">
                              <span className="text-base sm:text-lg font-bold text-primary">{candidate.percentage}%</span>
                              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{candidate.votes.toLocaleString()} votes</span>
                            </div>
                          </div>
                          <Progress value={candidate.percentage} className="h-2 sm:h-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground mt-8 sm:mt-12">© 2024 Voice Your Choice. All Rights Reserved.</footer>
    </div>
  );
};

export default Results;