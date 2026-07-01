import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, UserPlus, X, Shield, Users, Mail } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRoles {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  roles: AppRole[];
}

const AVAILABLE_ROLES: { value: AppRole; label: string; description: string }[] = [
  { value: "admin", label: "Admin", description: "Vollzugriff auf alle Funktionen über das Admin-Dashboard" },
  { value: "content_manager", label: "Content Manager", description: "Blog-Artikel, FAQs und Inhalte verwalten" },
  { value: "bmad_user", label: "BMAD User", description: "Zugriff nur auf das BMAD Portal" },
  { value: "user", label: "Kurs-Teilnehmer", description: "Zugriff nur auf die eigenen Kurse" },
];

const UserRoleManager = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole | "all">("all");
  const [addingRole, setAddingRole] = useState<{ userId: string; role: AppRole } | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("user");
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail || !inviteName) {
      toast.error("Bitte E-Mail und Name angeben");
      return;
    }
    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-invite-user", {
        body: { email: inviteEmail, full_name: inviteName, role: inviteRole },
      });
      if (error) throw error;
      if ((data as { already_existed?: boolean })?.already_existed) {
        toast.success("Nutzer existierte bereits – Rolle wurde hinzugefügt");
      } else {
        toast.success("Einladung versendet");
      }
      setInviteOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("user");
      fetchUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Fehler beim Einladen";
      toast.error(msg);
    } finally {
      setInviting(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => ({
        ...profile,
        roles: (roles || [])
          .filter((r) => r.user_id === profile.id)
          .map((r) => r.role as AppRole),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Fehler beim Laden der Benutzer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) {
        if (error.code === "23505") {
          toast.error("Diese Rolle ist bereits zugewiesen");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Rolle erfolgreich hinzugefügt");
      fetchUsers();
    } catch (error) {
      console.error("Error adding role:", error);
      toast.error("Fehler beim Hinzufügen der Rolle");
    }
    setAddingRole(null);
  };

  const removeRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;

      toast.success("Rolle erfolgreich entfernt");
      fetchUsers();
    } catch (error) {
      console.error("Error removing role:", error);
      toast.error("Fehler beim Entfernen der Rolle");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole =
      selectedRole === "all" || user.roles.includes(selectedRole);
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "content_manager":
        return "default";
      case "bmad_user":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getAvailableRolesForUser = (user: UserWithRoles) => {
    return AVAILABLE_ROLES.filter((r) => !user.roles.includes(r.value));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Benutzerverwaltung</CardTitle>
          </div>
          <CardDescription>
            Verwalten Sie Benutzerrollen und Berechtigungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Name oder E-Mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole | "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rolle filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Rollen</SelectItem>
                {AVAILABLE_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-sm text-muted-foreground">Gesamt Benutzer</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.roles.includes("admin")).length}
                </div>
                <div className="text-sm text-muted-foreground">Admins</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.roles.includes("bmad_user")).length}
                </div>
                <div className="text-sm text-muted-foreground">BMAD Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.roles.includes("user")).length}
                </div>
                <div className="text-sm text-muted-foreground">Kurs-Teilnehmer</div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Rollen</TableHead>
                  <TableHead>Registriert</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Keine Benutzer gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <span className="font-medium">{user.full_name || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length === 0 ? (
                            <span className="text-muted-foreground text-sm">Keine Rollen</span>
                          ) : (
                            user.roles.map((role) => (
                              <Badge
                                key={role}
                                variant={getRoleBadgeVariant(role)}
                                className="flex items-center gap-1"
                              >
                                {AVAILABLE_ROLES.find((r) => r.value === role)?.label || role}
                                <button
                                  onClick={() => removeRole(user.id, role)}
                                  className="ml-1 hover:bg-background/20 rounded-full p-0.5"
                                  title="Rolle entfernen"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("de-DE")}
                      </TableCell>
                      <TableCell className="text-right">
                        {addingRole?.userId === user.id ? (
                          <div className="flex items-center gap-2 justify-end">
                            <Select
                              value={addingRole.role}
                              onValueChange={(v) => setAddingRole({ userId: user.id, role: v as AppRole })}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableRolesForUser(user).map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => addRole(user.id, addingRole.role)}
                            >
                              Hinzufügen
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setAddingRole(null)}
                            >
                              Abbrechen
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const availableRoles = getAvailableRolesForUser(user);
                              if (availableRoles.length > 0) {
                                setAddingRole({ userId: user.id, role: availableRoles[0].value });
                              } else {
                                toast.info("Alle Rollen sind bereits zugewiesen");
                              }
                            }}
                            disabled={getAvailableRolesForUser(user).length === 0}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Rolle hinzufügen
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Role Legend */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Rollen-Übersicht
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_ROLES.map((role) => (
                <div key={role.value} className="flex items-start gap-2">
                  <Badge variant={getRoleBadgeVariant(role.value)} className="mt-0.5">
                    {role.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{role.description}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoleManager;
