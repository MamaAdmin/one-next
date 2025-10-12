import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { VoiceBotWidget } from "./VoiceBotWidget";

interface VoiceBotDialogProps {
  buttonText?: string;
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonClassName?: string;
  voiceBotUrl?: string;
}

export function VoiceBotDialog({ 
  buttonText = "Voice Bot öffnen",
  buttonSize = "lg",
  buttonClassName = "bg-gradient-primary hover:opacity-90 transition-opacity",
  voiceBotUrl
}: VoiceBotDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={buttonSize} className={buttonClassName}>
          <Mic className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Voice Bot</DialogTitle>
        </DialogHeader>
        <VoiceBotWidget url={voiceBotUrl} height="100%" />
      </DialogContent>
    </Dialog>
  );
}
