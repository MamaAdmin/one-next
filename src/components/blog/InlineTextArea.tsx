import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import { decodeHtmlEntitiesDeep } from "@/lib/html";

interface InlineTextAreaProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  isEditMode: boolean;
  className?: string;
  placeholder?: string;
  minRows?: number;
}

export const InlineTextArea = ({
  value,
  onSave,
  isEditMode,
  className,
  placeholder,
  minRows = 3,
}: InlineTextAreaProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = async () => {
    if (localValue !== value && localValue.trim()) {
      setIsSaving(true);
      try {
        await onSave(decodeHtmlEntitiesDeep(localValue.trim()));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } catch {
        setLocalValue(value);
      } finally {
        setIsSaving(false);
      }
    } else {
      setLocalValue(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setLocalValue(value);
      (e.target as HTMLTextAreaElement).blur();
    }
  };

  if (!isEditMode) {
    return (
      <div
        className={cn("prose prose-base max-w-none", className)}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtmlEntitiesDeep(value)) }}
      />
    );
  }

  return (
    <div className="relative">
      <Textarea
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={minRows}
        className={cn(
          "border-dashed border-2 hover:border-primary transition-colors resize-none",
          className
        )}
        disabled={isSaving}
      />
      {isSaving && (
        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
      )}
      {showSuccess && (
        <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
      )}
    </div>
  );
};
