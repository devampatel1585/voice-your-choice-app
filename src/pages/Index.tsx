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
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
                <Vote className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Voice Your Choice
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Empowering students to shape their future through democratic elections.
              Your vote, your voice, your representative.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="h-14 px-8 text-lg font-semibold">
                <Link to="/login">Cast Your Vote</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg font-semibold">
                <Link to="/candidates">View Candidates</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why Vote With Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your vote is encrypted and anonymous, ensuring complete privacy and security.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Know Your Candidates</h3>
              <p className="text-muted-foreground">
                Access detailed profiles, manifestos, and qualifications of all candidates.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Results</h3>
              <p className="text-muted-foreground">
                Track election results in real-time with transparent vote counting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Make Your Voice Heard?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of students in electing their representatives. Every vote counts.
            </p>
            <Button size="lg" asChild className="h-14 px-8 text-lg font-semibold">
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2024 Voice Your Choice. All Rights Reserved.</p>
        <p className="mt-2">Building democratic futures, one vote at a time.</p>
      </footer>
    </div>
  );
};

export default Index;
