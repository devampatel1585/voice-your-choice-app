import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, ArrowLeft, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import VotingStatusBanner from "@/components/VotingStatusBanner";
import { useCandidate } from "@/hooks/useCandidates";
import { useVoting } from "@/hooks/useVoting";
import { useAuth } from "@/contexts/AuthContext";
import { useVotingDeadline } from "@/hooks/useVotingDeadline";

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const { candidate, loading } = useCandidate(id || "");
  const { castVote, voting, hasVoted } = useVoting();
  const { user } = useAuth();
  const { deadline, isVotingOpen, loading: deadlineLoading } = useVotingDeadline();

  if (loading || deadlineLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Candidate Not Found</h1>
          <p className="text-muted-foreground mb-6">The candidate you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/candidates">Back to Candidates</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleVote = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowVoteDialog(true);
  };

  const confirmVote = async () => {
    const success = await castVote(candidate.id);
    if (success) {
      setShowVoteDialog(false);
      navigate("/thank-you");
    }
  };

  const renderVoteButton = () => {
    // Hide vote button if voting is closed
    if (!isVotingOpen) {
      return null;
    }

    if (!user) {
      return (
        <Button
          size="lg"
          className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
          asChild
        >
          <Link to="/login">Sign in to Vote</Link>
        </Button>
      );
    }

    if (hasVoted) {
      return (
        <Button
          size="lg"
          className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
          disabled
        >
          Already Voted
        </Button>
      );
    }

    return (
      <Button
        onClick={handleVote}
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90"
      >
        Vote Now
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4 sm:mb-6"
            onClick={() => navigate("/candidates")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Back to Candidates</span>
          </Button>

          <VotingStatusBanner deadline={deadline} isVotingOpen={isVotingOpen} />

          <Card className="mb-6 sm:mb-8 border-2">
            <CardHeader className="pb-4 sm:pb-6 p-4 sm:p-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 ring-4 ring-primary/30">
                  <AvatarImage src={candidate.avatar} alt={candidate.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-xl sm:text-2xl md:text-3xl">
                    {candidate.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">{candidate.name}</CardTitle>
                  <CardDescription className="text-sm sm:text-base md:text-lg">B.Tech 3rd Year</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="mb-6 sm:mb-8">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Manifesto</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {candidate.manifesto}
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 sm:mb-8">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Qualifications & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
              {candidate.qualifications.map((qual, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>{qual}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {renderVoteButton()}
        </div>
      </main>

      <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Confirm Your Vote</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Please review your selection before submitting.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 sm:py-6">
            <p className="text-muted-foreground mb-4">You have selected:</p>
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-lg">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-lg sm:text-xl">
                  {candidate.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-base sm:text-lg">{candidate.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">B.Tech 3rd Year</p>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            ⚠️ This action cannot be undone. You can only vote once.
          </p>
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => setShowVoteDialog(false)} className="w-full sm:w-auto">
              Go Back
            </Button>
            <Button
              onClick={confirmVote}
              disabled={voting}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent"
            >
              {voting ? "Submitting..." : "Confirm Vote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidateDetail;