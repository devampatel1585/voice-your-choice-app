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
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Election Results</h1>
            <p className="text-xl text-muted-foreground">3rd Year B.Tech Representative</p>
          </div>

          {winner && (
            <Card className="mb-12 border-2 border-success bg-gradient-to-br from-success/5 to-transparent">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-success to-secondary flex items-center justify-center">
                    <Trophy className="h-10 w-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl mb-2">Winner</CardTitle>
                <CardDescription className="text-xl font-semibold text-foreground">
                  {winner.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-lg font-medium">
                  Elected with <span className="text-success font-bold">{winner.votes.toLocaleString()} votes</span>
                </p>
                <p className="text-muted-foreground">
                  Secured {winner.percentage}% of the total votes.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Vote Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {resultsData.map((candidate) => (
                <div key={candidate.name} className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full ${
                      candidate.isWinner 
                        ? 'bg-gradient-to-br from-success to-secondary' 
                        : 'bg-gradient-to-br from-primary to-accent'
                    } flex items-center justify-center text-white font-bold`}>
                      {candidate.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="font-semibold text-lg">{candidate.name}</p>
                        <div className="text-right">
                          <span className="text-lg font-bold text-primary">{candidate.percentage}%</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {candidate.votes.toLocaleString()} votes
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={candidate.percentage} 
                        className="h-3"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground mt-12">
        © 2024 Voice Your Choice. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Results;
