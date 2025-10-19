import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

interface RichTextEditorProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  isEditMode: boolean;
  className?: string;
  placeholder?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image", "video"],
    ["blockquote", "code-block"],
    [{ color: [] }, { background: [] }],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "align",
  "link",
  "image",
  "video",
  "blockquote",
  "code-block",
  "color",
  "background",
];

export const RichTextEditor = ({
  value,
  onSave,
  isEditMode,
  className,
  placeholder,
}: RichTextEditorProps) => {
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
      } catch (error) {
        setLocalValue(value);
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (!isEditMode) {
    return (
      <div
        className={cn("prose prose-lg max-w-none", className)}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }}
      />
    );
  }

  return (
    <div className="relative">
      <ReactQuill
        theme="snow"
        value={localValue}
        onChange={setLocalValue}
        onBlur={handleBlur}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className={cn(
          "border-dashed border-2 hover:border-primary transition-colors rounded-lg",
          className
        )}
        readOnly={isSaving}
      />
      {isSaving && (
        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground z-10" />
      )}
      {showSuccess && (
        <Check className="absolute right-3 top-3 h-4 w-4 text-green-500 z-10" />
      )}
    </div>
  );
};
