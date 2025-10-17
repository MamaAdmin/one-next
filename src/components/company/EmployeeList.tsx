import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, User } from "lucide-react";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
}

interface EmployeeListProps {
  employees: Employee[];
}

export const EmployeeList = ({ employees }: EmployeeListProps) => {
  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      admin: "default",
      user: "secondary",
      pending: "outline",
    };
    
    const labels: Record<string, string> = {
      admin: "Administrator",
      user: "Benutzer",
      pending: "Ausstehend",
    };

    return (
      <Badge variant={variants[role] || "secondary"}>
        {labels[role] || role}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mitarbeiter ({employees.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="flex gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-full">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{employee.full_name}</p>
                    {getRoleBadge(employee.role)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {employee.email}
                  </div>
                  {employee.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {employee.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
