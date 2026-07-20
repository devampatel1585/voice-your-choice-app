import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Users, Plus, Pencil, Trash2, RotateCcw, Copy, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ClassRow {
  id: string;
  name: string;
  token: string;
  deadline: string;
  is_active: boolean;
}

interface Candidate {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  manifesto: string;
  qualifications: string[];
  votes: number;
  class_id: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [classesLoading, setClassesLoading] = useState(true);

  // Class form
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRow | null>(null);
  const [classForm, setClassForm] = useState({ name: "", token: "", date: "", time: "" });
  const [savingClass, setSavingClass] = useState(false);
  const [deleteClassDialog, setDeleteClassDialog] = useState<ClassRow | null>(null);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);

  const [restartDialogOpen, setRestartDialogOpen] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);

  const [formData, setFormData] = useState({ name: "", tagline: "", avatar: "", manifesto: "", qualifications: "" });

  const fetchClasses = useCallback(async () => {
    setClassesLoading(true);
    const { data } = await supabase.from("classes").select("*").order("created_at", { ascending: false });
    if (data) {
      setClasses(data as ClassRow[]);
      setSelectedClassId((prev) => prev && data.some((c) => c.id === prev) ? prev : (data[0]?.id ?? ""));
    }
    setClassesLoading(false);
  }, []);

  const fetchCandidates = useCallback(async (classId: string) => {
    if (!classId) { setCandidates([]); return; }
    setLoadingCandidates(true);
    const { data } = await supabase.from("candidates").select("*").eq("class_id", classId).order("name");
    if (data) setCandidates(data as Candidate[]);
    setLoadingCandidates(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/login"); return; }
    if (!adminLoading && !isAdmin && user) { toast.error("Access denied. Admin privileges required."); navigate("/"); return; }
    if (isAdmin) fetchClasses();
  }, [user, authLoading, isAdmin, adminLoading, navigate, fetchClasses]);

  useEffect(() => { fetchCandidates(selectedClassId); }, [selectedClassId, fetchCandidates]);

  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? null;

  const openClassDialog = (cls: ClassRow | null) => {
    setEditingClass(cls);
    if (cls) {
      const d = new Date(cls.deadline);
      setClassForm({ name: cls.name, token: cls.token, date: format(d, "yyyy-MM-dd"), time: format(d, "HH:mm") });
    } else {
      setClassForm({ name: "", token: "", date: format(new Date(Date.now() + 7 * 86400000), "yyyy-MM-dd"), time: "23:59" });
    }
    setClassDialogOpen(true);
  };

  const handleSaveClass = async () => {
    const name = classForm.name.trim();
    const token = classForm.token.trim().toUpperCase();
    if (!name || !token || !classForm.date || !classForm.time) { toast.error("Please fill all class fields"); return; }
    const deadlineISO = new Date(`${classForm.date}T${classForm.time}`).toISOString();
    setSavingClass(true);
    if (editingClass) {
      const { error } = await supabase.from("classes").update({ name, token, deadline: deadlineISO }).eq("id", editingClass.id);
      setSavingClass(false);
      if (error) { toast.error(error.message.includes("classes_token_key") ? "That token is already in use" : "Failed to update class"); return; }
      toast.success("Class updated");
    } else {
      const { data, error } = await supabase.from("classes").insert({ name, token, deadline: deadlineISO, is_active: true }).select().single();
      setSavingClass(false);
      if (error) { toast.error(error.message.includes("classes_token_key") ? "That token is already in use" : "Failed to create class"); return; }
      toast.success("Class created");
      if (data) setSelectedClassId(data.id);
    }
    setClassDialogOpen(false);
    fetchClasses();
  };

  const handleDeleteClass = async () => {
    if (!deleteClassDialog) return;
    const { error } = await supabase.from("classes").delete().eq("id", deleteClassDialog.id);
    if (error) { toast.error("Failed to delete class"); return; }
    toast.success("Class deleted");
    setDeleteClassDialog(null);
    fetchClasses();
  };

  const handleToggleActive = async (newActive: boolean) => {
    if (!selectedClass) return;
    setTogglingActive(true);
    const { error } = await supabase.from("classes").update({ is_active: newActive }).eq("id", selectedClass.id);
    setTogglingActive(false);
    if (error) toast.error("Failed to update status");
    else { toast.success(newActive ? "Voting resumed" : "Voting stopped"); fetchClasses(); }
  };

  const openAddDialog = () => {
    if (!selectedClassId) { toast.error("Create a class first"); return; }
    setSelectedCandidate(null);
    setFormData({ name: "", tagline: "", avatar: "", manifesto: "", qualifications: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setFormData({ name: candidate.name, tagline: candidate.tagline, avatar: candidate.avatar, manifesto: candidate.manifesto, qualifications: candidate.qualifications.join("\n") });
    setDialogOpen(true);
  };

  const handleSaveCandidate = async () => {
    if (!formData.name || !formData.tagline || !formData.avatar || !formData.manifesto) { toast.error("Please fill in all required fields"); return; }
    setSavingCandidate(true);
    const qualificationsArray = formData.qualifications.split("\n").map((q) => q.trim()).filter(Boolean);
    if (selectedCandidate) {
      const { error } = await supabase.from("candidates").update({
        name: formData.name, tagline: formData.tagline, avatar: formData.avatar,
        manifesto: formData.manifesto, qualifications: qualificationsArray,
      }).eq("id", selectedCandidate.id);
      setSavingCandidate(false);
      if (error) { toast.error("Failed to update candidate"); return; }
      toast.success("Candidate updated");
    } else {
      const { error } = await supabase.from("candidates").insert({
        name: formData.name, tagline: formData.tagline, avatar: formData.avatar,
        manifesto: formData.manifesto, qualifications: qualificationsArray,
        class_id: selectedClassId,
      });
      setSavingCandidate(false);
      if (error) { toast.error("Failed to add candidate"); return; }
      toast.success("Candidate added");
    }
    setDialogOpen(false);
    fetchCandidates(selectedClassId);
  };

  const handleDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    const { error } = await supabase.from("candidates").delete().eq("id", candidateToDelete.id);
    if (error) toast.error("Failed to delete candidate");
    else { toast.success("Candidate deleted"); fetchCandidates(selectedClassId); }
    setDeleteDialogOpen(false);
    setCandidateToDelete(null);
  };

  const handleRestartVoting = async () => {
    if (!selectedClass) return;
    setRestarting(true);
    const { error } = await supabase.rpc("restart_voting", {
      _class_id: selectedClass.id,
      _new_deadline: selectedClass.deadline,
    });
    setRestarting(false);
    setRestartDialogOpen(false);
    if (error) toast.error("Failed to restart voting: " + error.message);
    else { toast.success("Voting restarted for this class"); fetchClasses(); fetchCandidates(selectedClassId); }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("Token copied");
  };

  if (authLoading || adminLoading || classesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

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
              <p className="text-sm text-muted-foreground">Manage classes, tokens, and candidates</p>
            </div>
          </div>

          {/* Classes card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Classes & Tokens</CardTitle>
                  <CardDescription>Each class has a unique token students use to unlock their ballot.</CardDescription>
                </div>
                <Button size="sm" onClick={() => openClassDialog(null)}><Plus className="h-4 w-4 mr-2" /> Add class</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {classes.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No classes yet. Create one to get started.</div>
              ) : (
                classes.map((cls) => (
                  <div key={cls.id} className={`flex items-center gap-3 p-3 sm:p-4 border rounded-lg ${cls.id === selectedClassId ? "border-primary bg-primary/5" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{cls.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${cls.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                          {cls.is_active ? "Active" : "Stopped"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{cls.token}</code>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToken(cls.token)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <span className="text-xs text-muted-foreground">Deadline: {format(new Date(cls.deadline), "PPP p")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant={cls.id === selectedClassId ? "default" : "outline"} onClick={() => setSelectedClassId(cls.id)}>Manage</Button>
                      <Button size="icon" variant="outline" onClick={() => openClassDialog(cls)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="outline" className="text-destructive" onClick={() => setDeleteClassDialog(cls)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {selectedClass && (
            <>
              {/* Voting controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Voting controls · {selectedClass.name}</CardTitle>
                  <CardDescription>Pause, resume, or restart voting for this class.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{selectedClass.is_active ? "Voting is Active" : "Voting is Stopped"}</Label>
                      <p className="text-sm text-muted-foreground">Toggle to pause or resume voting for this class.</p>
                    </div>
                    <Switch checked={selectedClass.is_active} onCheckedChange={handleToggleActive} disabled={togglingActive} />
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <RotateCcw className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Restart voting</p>
                        <p className="text-xs text-muted-foreground mt-1">Clears all votes for this class and reopens voting until the current deadline.</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => setRestartDialogOpen(true)}>Restart</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Candidates */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Candidates · {selectedClass.name}</CardTitle>
                      <CardDescription>Candidates for the selected class.</CardDescription>
                    </div>
                    <Button onClick={openAddDialog} size="sm"><Plus className="h-4 w-4 mr-2" /> Add candidate</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingCandidates ? (
                    <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
                  ) : candidates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No candidates yet for this class.</div>
                  ) : (
                    <div className="space-y-4">
                      {candidates.map((candidate) => (
                        <div key={candidate.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <img src={candidate.avatar} alt={candidate.name} className="h-12 w-12 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{candidate.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{candidate.tagline}</p>
                          </div>
                          <div className="text-sm text-muted-foreground">{candidate.votes} votes</div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => openEditDialog(candidate)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="outline" size="icon" onClick={() => { setCandidateToDelete(candidate); setDeleteDialogOpen(true); }} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* Class dialog */}
      <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClass ? "Edit class" : "Add new class"}</DialogTitle>
            <DialogDescription>Set the class name, unique token, and voting deadline.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Class name *</Label>
              <Input value={classForm.name} onChange={(e) => setClassForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. B.Tech 2nd Year Election" />
            </div>
            <div className="space-y-2">
              <Label>Class token *</Label>
              <Input value={classForm.token} onChange={(e) => setClassForm((p) => ({ ...p, token: e.target.value.toUpperCase() }))} placeholder="e.g. CS3A-2026" className="uppercase tracking-wider" />
              <p className="text-xs text-muted-foreground">Only students with this token can view or vote in this class.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Deadline date *</Label>
                <Input type="date" value={classForm.date} onChange={(e) => setClassForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Deadline time *</Label>
                <Input type="time" value={classForm.time} onChange={(e) => setClassForm((p) => ({ ...p, time: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setClassDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveClass} disabled={savingClass}>{savingClass ? "Saving..." : editingClass ? "Update class" : "Create class"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Candidate dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCandidate ? "Edit candidate" : "Add candidate"}</DialogTitle>
            <DialogDescription>{selectedClass ? `For class: ${selectedClass.name}` : ""}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Tagline *</Label><Input value={formData.tagline} onChange={(e) => setFormData((p) => ({ ...p, tagline: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Avatar URL *</Label><Input value={formData.avatar} onChange={(e) => setFormData((p) => ({ ...p, avatar: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Manifesto *</Label><Textarea value={formData.manifesto} onChange={(e) => setFormData((p) => ({ ...p, manifesto: e.target.value }))} rows={4} /></div>
            <div className="space-y-2"><Label>Qualifications (one per line)</Label><Textarea value={formData.qualifications} onChange={(e) => setFormData((p) => ({ ...p, qualifications: e.target.value }))} rows={3} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCandidate} disabled={savingCandidate}>{savingCandidate ? "Saving..." : selectedCandidate ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete candidate */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete candidate</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete {candidateToDelete?.name}? All associated votes will also be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCandidate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete class */}
      <AlertDialog open={!!deleteClassDialog} onOpenChange={(o) => !o && setDeleteClassDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete class?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the class "{deleteClassDialog?.name}", all its candidates, and all votes cast in it.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClass} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete class</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restart voting */}
      <AlertDialog open={restartDialogOpen} onOpenChange={setRestartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart voting?</AlertDialogTitle>
            <AlertDialogDescription>This will delete all votes in "{selectedClass?.name}" and reopen voting until the current deadline.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restarting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestartVoting} disabled={restarting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{restarting ? "Restarting..." : "Yes, restart"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;