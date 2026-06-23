import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import { decodeHtmlEntitiesDeep } from "@/lib/html";

interface InlineTextFieldProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  isEditMode: boolean;
  className?: string;
  placeholder?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export const InlineTextField = ({
  value,
  onSave,
  isEditMode,
  className,
  placeholder,
  as: Component = "p",
}: InlineTextFieldProps) => {
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
        await onSave(localValue.trim());
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
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      setLocalValue(value);
      (e.target as HTMLInputElement).blur();
    }
  };
  const decoded = decodeHtmlEntitiesDeep(value || "");
  const looksLikeHtml = /<[^>]+>/.test(decoded) || decoded.includes("&lt;") || decoded.includes("&gt;");

  if (!isEditMode) {
    if (looksLikeHtml) {
      return (
        <Component
          className={cn("prose max-w-none", className)}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decoded) }}
        />
      );
    }
    return <Component className={className}>{decoded}</Component>;
  }

  return (
    <div className="relative">
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "border-dashed border-2 hover:border-primary transition-colors",
          className
        )}
        disabled={isSaving}
      />
      {isSaving && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
      )}
      {showSuccess && (
        <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
      )}
    </div>
  );
};
