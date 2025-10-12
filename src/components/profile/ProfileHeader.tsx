import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface ProfileHeaderProps {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
}

export const ProfileHeader = ({ name, email, avatar }: ProfileHeaderProps) => {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="flex items-center gap-6">
      <Avatar className="w-24 h-24">
        <AvatarImage src={avatar || undefined} alt={name || "User"} />
        <AvatarFallback className="text-2xl bg-primary/10">
          {avatar ? initials : <User className="w-12 h-12" />}
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-3xl font-bold">{name || "Mein Profil"}</h1>
        <p className="text-muted-foreground mt-1">{email}</p>
      </div>
    </div>
  );
};
