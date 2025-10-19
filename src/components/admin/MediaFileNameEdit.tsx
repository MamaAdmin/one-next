import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X } from "lucide-react";

interface MediaFileNameEditProps {
  filename: string;
  onRename: (newName: string) => void;
}

const MediaFileNameEdit = ({ filename, onRename }: MediaFileNameEditProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(filename);

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    
    if (!trimmedValue) {
      setEditValue(filename);
      setIsEditing(false);
      return;
    }

    // Preserve file extension
    const currentExt = filename.includes('.') ? filename.split('.').pop() : '';
    const newValueParts = trimmedValue.split('.');
    const newExt = newValueParts.length > 1 ? newValueParts.pop() : '';
    
    if (currentExt && currentExt !== newExt) {
      // Re-add original extension if changed or removed
      const nameWithoutExt = newValueParts.join('.');
      setEditValue(`${nameWithoutExt}.${currentExt}`);
      return;
    }

    if (trimmedValue !== filename) {
      onRename(trimmedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(filename);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 w-full">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="h-8 text-sm flex-1"
          autoFocus
          maxLength={255}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 flex-shrink-0"
          onClick={handleSave}
          type="button"
        >
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 flex-shrink-0"
          onClick={handleCancel}
          type="button"
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-2 group w-full cursor-pointer"
      onDoubleClick={() => setIsEditing(true)}
      title="Doppelklick zum Umbenennen"
    >
      <p className="text-sm font-medium truncate flex-1">{filename}</p>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        type="button"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default MediaFileNameEdit;
