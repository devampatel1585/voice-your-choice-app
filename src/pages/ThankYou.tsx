import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-success/10 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center px-4">
        <div className="mb-6 sm:mb-8 flex justify-center">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-success to-secondary flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
          Thank you for your vote!
        </h1>
        
        <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
          Your vote has been successfully submitted. Every vote counts in shaping the future of our college. 
          Stay tuned for the election results.
        </p>
        
        <Link to="/">
          <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold">
            Return to Home →
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ThankYou;
