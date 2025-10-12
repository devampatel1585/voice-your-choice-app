import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Vote, Users, TrendingUp, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20" />
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 sm:mb-8 flex justify-center">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
                <Vote className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent px-4">
              Voice Your Choice
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-4">
              Empowering students to shape their future through democratic elections.
              Your vote, your voice, your representative.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button size="lg" asChild className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold">
                <Link to="/login">Cast Your Vote</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold">
                <Link to="/candidates">View Candidates</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16">
            Why Vote With Us?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="text-center p-4 sm:p-6">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Your vote is encrypted and anonymous, ensuring complete privacy and security.
              </p>
            </div>
            <div className="text-center p-4 sm:p-6">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="h-7 w-7 sm:h-8 sm:w-8 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Know Your Candidates</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Access detailed profiles, manifestos, and qualifications of all candidates.
              </p>
            </div>
            <div className="text-center p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <TrendingUp className="h-7 w-7 sm:h-8 sm:w-8 text-accent" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Real-Time Results</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Track election results in real-time with transparent vote counting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Ready to Make Your Voice Heard?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
              Join thousands of students in electing their representatives. Every vote counts.
            </p>
            <Button size="lg" asChild className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold">
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground px-4">
        <p>© 2024 Voice Your Choice. All Rights Reserved.</p>
        <p className="mt-2">Building democratic futures, one vote at a time.</p>
      </footer>
    </div>
  );
};

export default Index;
