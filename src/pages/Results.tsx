import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";

const resultsData = [
  {
    name: "Sophia Carter",
    avatar: "SC",
    votes: 1250,
    percentage: 62.5,
    isWinner: true,
  },
  {
    name: "Ethan Bennett",
    avatar: "EB",
    votes: 980,
    percentage: 31.8,
    isWinner: false,
  },
  {
    name: "Olivia Davis",
    avatar: "OD",
    votes: 720,
    percentage: 5.7,
    isWinner: false,
  },
];

const Results = () => {
  const winner = resultsData.find((r) => r.isWinner);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4">Election Results</h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">3rd Year B.Tech Representative</p>
          </div>

          {winner && (
            <Card className="mb-8 sm:mb-12 border-2 border-success bg-gradient-to-br from-success/5 to-transparent">
              <CardHeader className="text-center pb-4 sm:pb-6 p-4 sm:p-6">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-success to-secondary flex items-center justify-center">
                    <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl sm:text-3xl mb-2">Winner</CardTitle>
                <CardDescription className="text-lg sm:text-xl font-semibold text-foreground">
                  {winner.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-2 p-4 pt-0 sm:p-6 sm:pt-0">
                <p className="text-base sm:text-lg font-medium">
                  Elected with <span className="text-success font-bold">{winner.votes.toLocaleString()} votes</span>
                </p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Secured {winner.percentage}% of the total votes.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Vote Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 pt-0 sm:p-6 sm:pt-0">
              {resultsData.map((candidate) => (
                <div key={candidate.name} className="space-y-2">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full ${
                      candidate.isWinner 
                        ? 'bg-gradient-to-br from-success to-secondary' 
                        : 'bg-gradient-to-br from-primary to-accent'
                    } flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0`}>
                      {candidate.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-2 mb-1">
                        <p className="font-semibold text-base sm:text-lg truncate">{candidate.name}</p>
                        <div className="flex items-baseline gap-1 sm:gap-2">
                          <span className="text-base sm:text-lg font-bold text-primary">{candidate.percentage}%</span>
                          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                            {candidate.votes.toLocaleString()} votes
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={candidate.percentage} 
                        className="h-2 sm:h-3"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground mt-8 sm:mt-12">
        © 2024 Voice Your Choice. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Results;
