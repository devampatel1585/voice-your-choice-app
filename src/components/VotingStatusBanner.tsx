import { format } from "date-fns";
import { Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface VotingStatusBannerProps {
  deadline: Date | null;
  isVotingOpen: boolean;
}

const VotingStatusBanner = ({ deadline, isVotingOpen }: VotingStatusBannerProps) => {
  if (!deadline) return null;

  if (!isVotingOpen) {
    return (
      <Card className="border-destructive/50 bg-destructive/5 mb-6">
        <CardContent className="flex items-center gap-3 py-4">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div>
            <p className="font-semibold text-destructive">Voting has ended</p>
            <p className="text-sm text-muted-foreground">
              Voting closed on {format(deadline, "PPP 'at' p")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50 bg-primary/5 mb-6">
      <CardContent className="flex items-center gap-3 py-4">
        <Clock className="h-5 w-5 text-primary flex-shrink-0" />
        <div>
          <p className="font-semibold text-primary">Voting is open</p>
          <p className="text-sm text-muted-foreground">
            Deadline: {format(deadline, "PPP 'at' p")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VotingStatusBanner;