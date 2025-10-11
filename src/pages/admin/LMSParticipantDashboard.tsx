import { useState } from "react";
import { useParticipants } from "@/hooks/useParticipants";
import { useCustomer } from "@/hooks/useCustomer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

export default function LMSParticipantDashboard() {
  const { participants, loading, createParticipant, updateParticipant, deleteParticipant } = useParticipants();
  const { customers } = useCustomer();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customer_id: "",
    email: "",
    full_name: "",
  });

  const handleSubmit = async () => {
    if (editingId) {
      await updateParticipant(editingId, formData);
    } else {
      await createParticipant(formData);
    }
    setIsCreateOpen(false);
    setEditingId(null);
    setFormData({ customer_id: "", email: "", full_name: "" });
  };

  const handleEdit = (participant: any) => {
    setEditingId(participant.id);
    setFormData({
      customer_id: participant.customer_id,
      email: participant.email,
      full_name: participant.full_name,
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Teilnehmer wirklich löschen? Dies löscht auch alle Enrollments!")) {
      await deleteParticipant(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Teilnehmer-Verwaltung</CardTitle>
              <CardDescription>Verwalten Sie alle Kursteilnehmer</CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingId(null);
                  setFormData({ customer_id: "", email: "", full_name: "" });
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Neuer Teilnehmer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Teilnehmer bearbeiten" : "Neuer Teilnehmer"}
                  </DialogTitle>
                  <DialogDescription>
                    Geben Sie die Teilnehmer-Daten ein
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer">Kunde</Label>
                    <Select
                      value={formData.customer_id}
                      onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kunde wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="full_name">Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit}>
                    {editingId ? "Aktualisieren" : "Erstellen"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.full_name}</TableCell>
                  <TableCell>{participant.email}</TableCell>
                  <TableCell>{participant.customers?.company_name}</TableCell>
                  <TableCell>{new Date(participant.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(participant)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(participant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
