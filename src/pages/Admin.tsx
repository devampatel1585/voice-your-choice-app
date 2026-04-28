import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Calendar, Clock, Shield, Users, Plus, Pencil, Trash2, X, RotateCcw, Tag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Candidate {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  manifesto: string;
  qualifications: string[];
  votes: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [deadline, setDeadline] = useState("");
  const [time, setTime] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Candidate management state
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [restartDialogOpen, setRestartDialogOpen] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [electionName, setElectionName] = useState("");
  const [savingName, setSavingName] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    avatar: "",
    manifesto: "",
    qualifications: "",
  });

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

    const fetchElectionName = async () => {
      const { data } = await supabase
        .from("election_settings")
        .select("value")
        .eq("key", "election_name")
        .maybeSingle();
      if (data?.value) {
        const v = data.value as { name?: string };
        if (v?.name) setElectionName(v.name);
      }
    };

    const fetchCandidates = async () => {
      setLoadingCandidates(true);
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("name");
      
      if (!error && data) {
        setCandidates(data);
      }
      setLoadingCandidates(false);
    };

    if (isAdmin) {
      fetchSettings();
      fetchCandidates();
      fetchElectionName();
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

  const handleSaveElectionName = async () => {
    const trimmed = electionName.trim();
    if (!trimmed) {
      toast.error("Election name cannot be empty");
      return;
    }
    setSavingName(true);
    const { error } = await supabase
      .from("election_settings")
      .upsert(
        {
          key: "election_name",
          value: { name: trimmed },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );
    setSavingName(false);
    if (error) {
      toast.error("Failed to save election name");
    } else {
      toast.success("Election name updated!");
    }
  };

  const handleToggleActive = async (newActive: boolean) => {
    if (!deadline || !time) {
      toast.error("Please set a deadline date and time first");
      return;
    }
    setTogglingActive(true);
    const previous = isActive;
    setIsActive(newActive);
    const deadlineDateTime = new Date(`${deadline}T${time}`);
    const { error } = await supabase
      .from("election_settings")
      .update({
        value: {
          deadline: deadlineDateTime.toISOString(),
          is_active: newActive,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("key", "voting_deadline");
    setTogglingActive(false);
    if (error) {
      setIsActive(previous);
      toast.error("Failed to update voting status");
    } else {
      toast.success(newActive ? "Voting resumed" : "Voting stopped");
    }
  };

  const openAddDialog = () => {
    setSelectedCandidate(null);
    setFormData({
      name: "",
      tagline: "",
      avatar: "",
      manifesto: "",
      qualifications: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setFormData({
      name: candidate.name,
      tagline: candidate.tagline,
      avatar: candidate.avatar,
      manifesto: candidate.manifesto,
      qualifications: candidate.qualifications.join("\n"),
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (candidate: Candidate) => {
    setCandidateToDelete(candidate);
    setDeleteDialogOpen(true);
  };

  const handleSaveCandidate = async () => {
    if (!formData.name || !formData.tagline || !formData.avatar || !formData.manifesto) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSavingCandidate(true);
    const qualificationsArray = formData.qualifications
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    if (selectedCandidate) {
      // Update existing candidate
      const { error } = await supabase
        .from("candidates")
        .update({
          name: formData.name,
          tagline: formData.tagline,
          avatar: formData.avatar,
          manifesto: formData.manifesto,
          qualifications: qualificationsArray,
        })
        .eq("id", selectedCandidate.id);

      if (error) {
        toast.error("Failed to update candidate");
      } else {
        toast.success("Candidate updated successfully!");
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === selectedCandidate.id
              ? { ...c, ...formData, qualifications: qualificationsArray }
              : c
          )
        );
        setDialogOpen(false);
      }
    } else {
      // Add new candidate
      const { data, error } = await supabase
        .from("candidates")
        .insert({
          name: formData.name,
          tagline: formData.tagline,
          avatar: formData.avatar,
          manifesto: formData.manifesto,
          qualifications: qualificationsArray,
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to add candidate");
      } else {
        toast.success("Candidate added successfully!");
        setCandidates((prev) => [...prev, data]);
        setDialogOpen(false);
      }
    }
    setSavingCandidate(false);
  };

  const handleDeleteCandidate = async () => {
    if (!candidateToDelete) return;

    const { error } = await supabase
      .from("candidates")
      .delete()
      .eq("id", candidateToDelete.id);

    if (error) {
      toast.error("Failed to delete candidate");
    } else {
      toast.success("Candidate deleted successfully!");
      setCandidates((prev) => prev.filter((c) => c.id !== candidateToDelete.id));
    }
    setDeleteDialogOpen(false);
    setCandidateToDelete(null);
  };

  const handleRestartVoting = async () => {
    if (!deadline || !time) {
      toast.error("Please set a new deadline date and time first");
      return;
    }
    setRestarting(true);
    const newDeadline = new Date(`${deadline}T${time}`);
    const { error } = await supabase.rpc("restart_voting", {
      _new_deadline: newDeadline.toISOString(),
    });
    setRestarting(false);
    setRestartDialogOpen(false);
    if (error) {
      toast.error("Failed to restart voting: " + error.message);
    } else {
      setIsActive(true);
      toast.success("Voting restarted! All votes cleared and students can vote again.");
      // Refresh candidates to reflect cleared vote counts
      const { data } = await supabase.from("candidates").select("*").order("name");
      if (data) setCandidates(data);
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
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage election settings and candidates</p>
            </div>
          </div>

          {/* Election Name Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Election Name
              </CardTitle>
              <CardDescription>
                Set the name of the current election (e.g., "B.Tech 2nd Year Election", "4th Semester Election"). This title appears across the site for students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="electionName">Election Title</Label>
                <Input
                  id="electionName"
                  value={electionName}
                  onChange={(e) => setElectionName(e.target.value)}
                  placeholder="e.g., B.Tech 2nd Year Election"
                  className="h-12"
                />
              </div>
              <Button
                onClick={handleSaveElectionName}
                disabled={savingName}
                className="w-full h-12"
              >
                {savingName ? "Saving..." : "Save Election Name"}
              </Button>
            </CardContent>
          </Card>

          {/* Voting Deadline Card */}
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
                  <Label>{isActive ? "Voting is Active" : "Voting is Stopped"}</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn off to immediately stop voting. Turn on to resume voting until the deadline.
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={handleToggleActive}
                  disabled={togglingActive}
                />
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

              <div className="border-t pt-4">
                <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <RotateCcw className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Restart Voting</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Clears all cast votes, resets every student's voting status, and reactivates voting using the deadline above.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setRestartDialogOpen(true)}
                  >
                    Restart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidate Management Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Manage Candidates
                  </CardTitle>
                  <CardDescription>
                    Add, edit, or remove election candidates
                  </CardDescription>
                </div>
                <Button onClick={openAddDialog} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Candidate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingCandidates ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No candidates yet. Add your first candidate!
                </div>
              ) : (
                <div className="space-y-4">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <img
                        src={candidate.avatar}
                        alt={candidate.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{candidate.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {candidate.tagline}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {candidate.votes} votes
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(candidate)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(candidate)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add/Edit Candidate Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedCandidate ? "Edit Candidate" : "Add New Candidate"}
            </DialogTitle>
            <DialogDescription>
              {selectedCandidate
                ? "Update the candidate's information below."
                : "Fill in the details for the new candidate."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Candidate name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline *</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tagline: e.target.value }))
                }
                placeholder="Brief tagline or slogan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL *</Label>
              <Input
                id="avatar"
                value={formData.avatar}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, avatar: e.target.value }))
                }
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manifesto">Manifesto *</Label>
              <Textarea
                id="manifesto"
                value={formData.manifesto}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, manifesto: e.target.value }))
                }
                placeholder="Candidate's manifesto and goals..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications (one per line)</Label>
              <Textarea
                id="qualifications"
                value={formData.qualifications}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    qualifications: e.target.value,
                  }))
                }
                placeholder="Previous Student Council Member&#10;3.8 GPA&#10;Club President"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCandidate} disabled={savingCandidate}>
              {savingCandidate
                ? "Saving..."
                : selectedCandidate
                ? "Update Candidate"
                : "Add Candidate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {candidateToDelete?.name}? This
              action cannot be undone and will also remove all associated votes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCandidate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restart Voting Confirmation */}
      <AlertDialog open={restartDialogOpen} onOpenChange={setRestartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart voting?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all cast votes, reset every student's voting status,
              and reopen voting until the deadline you've set above. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restarting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestartVoting}
              disabled={restarting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {restarting ? "Restarting..." : "Yes, restart voting"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
