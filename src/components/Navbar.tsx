import { Link } from "react-router-dom";
import { Vote } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Vote className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Voice Your Choice
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/candidates" className="text-sm font-medium hover:text-primary transition-colors">
            Candidates
          </Link>
          <Link to="/results" className="text-sm font-medium hover:text-primary transition-colors">
            Results
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
