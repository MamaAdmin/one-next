import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Check, Loader2, FileText, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import { MarkdownEditor } from "./MarkdownEditor";
import { Button } from "@/components/ui/button";
import TurndownService from "turndown";

interface RichTextEditorProps {
  value: string;
  onSave?: (value: string) => Promise<void>;
  onChange?: (value: string) => void;
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
  onChange,
  isEditMode,
  className,
  placeholder,
}: RichTextEditorProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editorMode, setEditorMode] = useState<"rich" | "markdown">("rich");
  const [markdownValue, setMarkdownValue] = useState("");

  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });

  useEffect(() => {
    setLocalValue(value);
    if (editorMode === "markdown") {
      const markdown = turndownService.turndown(value || "");
      setMarkdownValue(markdown);
    }
  }, [value]);

  const toggleEditorMode = () => {
    if (editorMode === "rich") {
      // Switch to Markdown: Convert HTML to Markdown
      const markdown = turndownService.turndown(localValue || "");
      setMarkdownValue(markdown);
      setEditorMode("markdown");
    } else {
      // Switch to Rich: Keep HTML (already stored in localValue)
      setEditorMode("rich");
    }
  };

  const handleChange = (content: string) => {
    setLocalValue(content);
    // Sofortige Synchronisation wenn onChange bereitgestellt wird
    if (onChange) {
      onChange(content);
    }
  };

  const handleBlur = async () => {
    if (onSave && localValue !== value && localValue.trim()) {
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
    <div className="space-y-2">
      {isEditMode && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleEditorMode}
            className="gap-2"
          >
            {editorMode === "rich" ? (
              <>
                <Code className="h-4 w-4" />
                Markdown
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Rich Text
              </>
            )}
          </Button>
        </div>
      )}
      <div className="relative">
        {editorMode === "markdown" && isEditMode ? (
          <MarkdownEditor
            value={markdownValue}
            onChange={(md) => {
              setMarkdownValue(md);
              // Store as HTML for compatibility
              handleChange(md); // Will be converted to HTML on backend if needed
            }}
            className={className}
            placeholder={placeholder}
          />
        ) : (
          <ReactQuill
            theme="snow"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            className={cn(
              "border-dashed border-2 hover:border-primary transition-colors rounded-lg",
              className
            )}
            readOnly={isSaving || !isEditMode}
          />
        )}
        {isSaving && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground z-10" />
        )}
        {showSuccess && (
          <Check className="absolute right-3 top-3 h-4 w-4 text-green-500 z-10" />
        )}
      </div>
    </div>
  );
};
