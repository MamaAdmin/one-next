import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const MarkdownEditor = ({
  value,
  onChange,
  className,
  placeholder = "Write your markdown here...",
}: MarkdownEditorProps) => {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  return (
    <div className={cn("w-full", className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "write" | "preview")}>
        <TabsList className="mb-2">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="write" className="mt-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[400px] font-mono"
          />
        </TabsContent>
        
        <TabsContent value="preview" className="mt-0">
          <div className="min-h-[400px] border rounded-md p-4 bg-background">
            <ReactMarkdown
              className="prose prose-sm dark:prose-invert max-w-none"
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const inline = !match;
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {value || "*Nothing to preview*"}
            </ReactMarkdown>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
