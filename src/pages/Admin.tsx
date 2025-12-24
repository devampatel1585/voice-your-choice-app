import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Calendar, Clock, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [deadline, setDeadline] = useState("");
  const [time, setTime] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (!adminLoading && !isAdmin && user) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("election_settings")
        .select("value")
        .eq("key", "voting_deadline")
        .maybeSingle();

      if (!error && data) {
        const settings = data.value as { deadline: string; is_active: boolean };
        const deadlineDate = new Date(settings.deadline);
        setDeadline(format(deadlineDate, "yyyy-MM-dd"));
        setTime(format(deadlineDate, "HH:mm"));
        setIsActive(settings.is_active);
      }
    };

    if (isAdmin) {
      fetchSettings();
    }
  }, [user, authLoading, isAdmin, adminLoading, navigate]);

  const handleSave = async () => {
    if (!deadline || !time) {
      toast.error("Please set both date and time");
      return;
    }

    setSaving(true);
    const deadlineDateTime = new Date(`${deadline}T${time}`);

    const { error } = await supabase
      .from("election_settings")
      .update({
        value: {
          deadline: deadlineDateTime.toISOString(),
          is_active: isActive,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("key", "voting_deadline");

    setSaving(false);

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Voting deadline updated successfully!");
    }
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage election settings</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Voting Deadline
              </CardTitle>
              <CardDescription>
                Set when voting closes. Voting buttons will be hidden after this time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Voting Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle to enable/disable voting manually
                  </p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Deadline Date
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Deadline Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              {deadline && time && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Voting will close on:{" "}
                    <span className="font-semibold text-foreground">
                      {format(new Date(`${deadline}T${time}`), "PPP 'at' p")}
                    </span>
                  </p>
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12"
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;