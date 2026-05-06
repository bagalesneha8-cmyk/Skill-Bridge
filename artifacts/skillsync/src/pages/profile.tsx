import { useState } from "react";
import { useGetMe, useUpdateUser, useGetUserSkills, useGetUserBadges, getGetMeQueryKey, getGetUserSkillsQueryKey, getGetUserBadgesQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { User, MapPin, Building, Edit2, Save, Trophy, Award, Star, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { user: authUser } = useAuth();
  const headers = getAuthHeaders();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);

  const { data: me, isLoading } = useGetMe({
    request: { headers },
    query: { queryKey: getGetMeQueryKey() },
  });

  const { data: skills } = useGetUserSkills(authUser?.id ?? 0, {
    request: { headers },
    query: { enabled: !!authUser?.id, queryKey: getGetUserSkillsQueryKey(authUser?.id ?? 0) },
  });

  const { data: gamification } = useGetUserBadges({
    request: { headers },
    query: { queryKey: getGetUserBadgesQueryKey() },
  });

  const updateMutation = useUpdateUser();

  const user = me as { id: number; name: string; email: string; role: string; bio?: string; institution?: string; location?: string; xp: number; level: number; streak: number } | undefined;
  const [editName, setEditName] = useState(user?.name ?? "");
  const [editBio, setEditBio] = useState(user?.bio ?? "");
  const [editLocation, setEditLocation] = useState(user?.location ?? "");
  const [editInstitution, setEditInstitution] = useState(user?.institution ?? "");

  const g = gamification as { xp?: number; level?: number; badges?: Array<{ id: number; name: string; description: string; icon: string }> } | undefined;

  function startEdit() {
    setEditName(user?.name ?? "");
    setEditBio(user?.bio ?? "");
    setEditLocation(user?.location ?? "");
    setEditInstitution(user?.institution ?? "");
    setEditing(true);
  }

  function saveEdit() {
    if (!user?.id) return;
    updateMutation.mutate({ id: user.id, data: { name: editName, bio: editBio, location: editLocation, institution: editInstitution } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setEditing(false);
        toast({ title: "Profile updated!" });
      },
    });
  }

  const levelProgress = Math.min(100, ((user?.xp ?? 0) % 500) / 5);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main profile */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 border border-border rounded-lg bg-card">
            {isLoading ? <Skeleton className="h-32" /> : (
              <>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      {editing ? (
                        <Input value={editName} onChange={e => setEditName(e.target.value)} className="mb-1" data-testid="input-profile-name" />
                      ) : (
                        <h2 className="text-xl font-bold">{user?.name}</h2>
                      )}
                      <p className="text-sm text-muted-foreground capitalize">{user?.role?.replace("_", " ")}</p>
                    </div>
                  </div>
                  {editing ? (
                    <Button size="sm" onClick={saveEdit} disabled={updateMutation.isPending} className="gap-1" data-testid="button-save-profile">
                      <Save className="w-3 h-3" /> Save
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={startEdit} className="gap-1" data-testid="button-edit-profile">
                      <Edit2 className="w-3 h-3" /> Edit
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="w-4 h-4" />
                    {editing ? <Input value={editInstitution} onChange={e => setEditInstitution(e.target.value)} placeholder="Institution" className="h-7 text-sm" data-testid="input-profile-institution" /> : <span>{user?.institution ?? "—"}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {editing ? <Input value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="Location" className="h-7 text-sm" data-testid="input-profile-location" /> : <span>{user?.location ?? "—"}</span>}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Bio</div>
                  {editing ? (
                    <Textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} placeholder="Tell us about yourself..." data-testid="input-profile-bio" />
                  ) : (
                    <p className="text-sm text-muted-foreground">{user?.bio ?? "No bio added yet."}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Skills */}
          <div className="p-6 border border-border rounded-lg bg-card">
            <h2 className="font-semibold mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(skills) && skills.length > 0 ? (
                (skills as Array<{ id: number; skill: string; level: string; verified: boolean }>).map(s => (
                  <div key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-full text-sm" data-testid={`skill-tag-${s.id}`}>
                    <span>{s.skill}</span>
                    <span className="text-muted-foreground text-xs">· {s.level}</span>
                    {s.verified && <span className="text-primary text-xs">✓</span>}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No skills added yet. Add skills through the resume section.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: gamification */}
        <div className="space-y-4">
          {/* XP */}
          <div className="p-5 border border-border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold">Progress</span>
            </div>
            <div className="text-center mb-3">
              <div className="text-4xl font-bold font-mono text-primary">Lv.{user?.level}</div>
            </div>
            <div className="bg-secondary rounded-full h-2 mb-2">
              <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>{user?.xp} XP</span>
              <span>{500 - ((user?.xp ?? 0) % 500)} to next</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-sm">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-mono font-semibold">{user?.streak}</span>
              <span className="text-muted-foreground text-xs">day streak</span>
            </div>
          </div>

          {/* Badges */}
          <div className="p-5 border border-border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-purple-500" />
              <span className="font-semibold">Badges ({g?.badges?.length ?? 0})</span>
            </div>
            <div className="space-y-2">
              {g?.badges && g.badges.length > 0 ? (
                g.badges.map(badge => (
                  <div key={badge.id} className="flex items-center gap-2 p-2 bg-secondary rounded-lg" data-testid={`profile-badge-${badge.id}`}>
                    <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-medium">{badge.name}</div>
                      <div className="text-xs text-muted-foreground">{badge.description}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No badges yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
