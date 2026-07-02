import Navigation from "@/components/Navigation";
import VoiceRAGBot from '@/components/VoiceRAGBot';

export default function VoiceBot() {
  return (
    <>
      <Navigation />
      <div className="mt-32">
        <VoiceRAGBot />
      </div>
    </>
  );
}
