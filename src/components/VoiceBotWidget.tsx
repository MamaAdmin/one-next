interface VoiceBotWidgetProps {
  url?: string;
  width?: string;
  height?: string;
  className?: string;
}

export function VoiceBotWidget({ 
  url = "https://one-next.lovable.app/voice-bot",
  width = "100%",
  height = "800px",
  className = ""
}: VoiceBotWidgetProps) {
  return (
    <iframe 
      src={url}
      allow="microphone; autoplay"
      style={{ width, height, border: 'none' }}
      className={className}
      title="Voice Bot"
    />
  );
}
