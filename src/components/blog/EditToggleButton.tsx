import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditToggleButtonProps {
  isEditMode: boolean;
  onToggle: () => void;
}

export const EditToggleButton = ({ isEditMode, onToggle }: EditToggleButtonProps) => {
  return (
    <Button
      onClick={onToggle}
      variant={isEditMode ? "destructive" : "secondary"}
      size="sm"
      className="fixed bottom-6 right-6 z-50 shadow-lg"
    >
      {isEditMode ? (
        <>
          <X className="mr-2 h-4 w-4" />
          Bearbeitungsmodus verlassen
        </>
      ) : (
        <>
          <Pencil className="mr-2 h-4 w-4" />
          Bearbeitungsmodus
        </>
      )}
    </Button>
  );
};
