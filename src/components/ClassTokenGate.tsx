import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useClassAccess } from "@/hooks/useClassAccess";

interface ClassTokenGateProps {
  title?: string;
  description?: string;
}

const ClassTokenGate = ({
  title = "Enter your class token",
  description = "Your admin has shared a unique token for your class. Enter it below to see your class's candidates and cast your vote.",
}: ClassTokenGateProps) => {
  const { verifyToken } = useClassAccess();
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await verifyToken(token);
    setSubmitting(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Class verified");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <KeyRound className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class-token">Class token</Label>
              <Input
                id="class-token"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                placeholder="e.g. CS3A-2026"
                className="h-12 uppercase tracking-wider"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full h-12" disabled={submitting}>
              {submitting ? "Verifying..." : "Unlock class"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default ClassTokenGate;