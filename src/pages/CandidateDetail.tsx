import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Award, BookOpen, Users } from "lucide-react";
import Navbar from "@/components/Navbar";

const candidatesData: Record<string, any> = {
  "1": {
    name: "Ethan Harper",
    year: "3rd Year B.Tech",
    avatar: "EH",
    manifesto: "My vision for our batch is to foster a more inclusive and collaborative environment. I aim to bridge the gap between students and faculty, ensuring our voices are heard. Key initiatives include organizing tech workshops, career guidance sessions, and cultural events that celebrate our diversity. I'm committed to transparency and will regularly update you on our progress.",
    qualifications: {
      academic: "Dean's List for all semesters, GPA: 3.9/4.0",
      leadership: "President of the Computer Science Club, led a team of 20 members",
      extracurricular: "Active member of the Debate Society, participated in national-level competitions"
    }
  },
  "2": {
    name: "Olivia Bennett",
    year: "3rd Year B.Tech",
    avatar: "OB",
    manifesto: "I believe in strengthening academic support systems and ensuring every student has access to the resources they need to excel. My focus will be on establishing peer tutoring programs, improving library facilities, and advocating for better course materials and online learning resources.",
    qualifications: {
      academic: "Topper in Computer Science Department, GPA: 4.0/4.0",
      leadership: "Vice President of Student Council, organized multiple academic seminars",
      extracurricular: "Volunteer at local coding bootcamps, mentored 50+ students"
    }
  },
  "3": {
    name: "Noah Carter",
    year: "3rd Year B.Tech",
    avatar: "NC",
    manifesto: "Mental health is often overlooked in our academic journey. I'm committed to creating awareness and establishing support systems for students facing stress, anxiety, and other challenges. My initiatives include wellness workshops, counseling support, and stress-free zones on campus.",
    qualifications: {
      academic: "Dean's List, specialized in AI and Machine Learning, GPA: 3.8/4.0",
      leadership: "Founded Mental Health Awareness Club with 100+ active members",
      extracurricular: "Certified peer counselor, conducted 20+ wellness sessions"
    }
  },
  "4": {
    name: "Ava Thompson",
    year: "3rd Year B.Tech",
    avatar: "AT",
    manifesto: "Diversity and inclusion are the cornerstones of a thriving academic community. I'm dedicated to creating an environment where every student feels valued and represented. My plans include diversity workshops, cultural exchange programs, and policies that ensure equal opportunities for all.",
    qualifications: {
      academic: "Honors in Software Engineering, GPA: 3.85/4.0",
      leadership: "President of Women in Tech Society, increased membership by 150%",
      extracurricular: "Organized 5 major diversity and inclusion events"
    }
  }
};

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const candidate = candidatesData[id || "1"];

  const handleVote = () => {
    setShowVoteDialog(true);
  };

  const confirmVote = () => {
    navigate("/thank-you");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8 border-2">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-3xl">
                  {candidate.avatar}
                </div>
                <div>
                  <CardTitle className="text-3xl mb-2">{candidate.name}</CardTitle>
                  <CardDescription className="text-lg">{candidate.year}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Manifesto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-base">
                {candidate.manifesto}
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Qualifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Academic Achievements</h3>
                  <p className="text-muted-foreground">{candidate.qualifications.academic}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Leadership Experience</h3>
                  <p className="text-muted-foreground">{candidate.qualifications.leadership}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Extracurricular Activities</h3>
                  <p className="text-muted-foreground">{candidate.qualifications.extracurricular}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleVote}
            size="lg"
            className="w-full h-14 text-lg font-semibold"
          >
            Vote Now
          </Button>
        </div>
      </main>

      <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Confirm Your Vote</DialogTitle>
            <DialogDescription className="text-base">
              Please review your selection before submitting.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <p className="text-muted-foreground mb-4">You have selected:</p>
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                {candidate.avatar}
              </div>
              <div>
                <p className="font-semibold text-lg">{candidate.name}</p>
                <p className="text-sm text-muted-foreground">{candidate.year}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowVoteDialog(false)}>
              Go Back
            </Button>
            <Button onClick={confirmVote}>Confirm Vote</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidateDetail;
