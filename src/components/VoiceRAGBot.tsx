import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const WEBHOOK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-rag`;
const MAX_RECORDING_TIME = 90000; // 90 seconds

type Status = 'idle' | 'recording' | 'processing' | 'playing' | 'success' | 'error';

interface DiagnosticInfo {
  microphoneAccess: boolean;
  httpsEnabled: boolean;
  browserSupported: boolean;
  webhookReachable: boolean | null;
}

export default function VoiceRAGBot() {
  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo>({
    microphoneAccess: false,
    httpsEnabled: window.location.protocol === 'https:',
    browserSupported: 'MediaRecorder' in window,
    webhookReachable: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Test mode for diagnostics
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') === '1') {
      runDiagnostics();
    }
  }, []);

  const runDiagnostics = async () => {
    console.log('🔍 Running diagnostics...');
    
    // Test microphone access
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setDiagnostics(prev => ({ ...prev, microphoneAccess: true }));
      console.log('✅ Microphone access granted');
    } catch (error) {
      console.error('❌ Microphone access denied:', error);
    }

    // Test webhook reachability
    try {
      const response = await fetch(WEBHOOK_URL, { method: 'HEAD' });
      setDiagnostics(prev => ({ ...prev, webhookReachable: response.ok }));
      console.log(`${response.ok ? '✅' : '❌'} Webhook reachable:`, response.status);
    } catch (error) {
      setDiagnostics(prev => ({ ...prev, webhookReachable: false }));
      console.error('❌ Webhook unreachable:', error);
    }

    console.log('📊 Diagnostics complete:', diagnostics);
  };

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setDiagnostics(prev => ({ ...prev, microphoneAccess: true }));

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Clear intervals
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current);
        }

        // Process recording
        await processRecording();
      };

      mediaRecorder.start();
      setStatus('recording');
      setRecordingTime(0);
      setTranscript('');
      setResponse('');

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 100);
      }, 100);

      // Auto-stop after max time
      maxTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
          toast({
            title: 'Maximale Aufnahmezeit erreicht',
            description: '90 Sekunden überschritten. Aufnahme gestoppt.',
          });
        }
      }, MAX_RECORDING_TIME);

      toast({
        title: 'Aufnahme gestartet',
        description: 'Sprechen Sie jetzt Ihre Frage...',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      setStatus('error');
      
      let errorMessage = 'Fehler beim Starten der Aufnahme.';
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Kein Mikrofon gefunden. Bitte schließen Sie ein Mikrofon an.';
        }
      }
      
      toast({
        title: 'Fehler',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const processRecording = async () => {
    setStatus('processing');
    
    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      if (audioBlob.size === 0) {
        throw new Error('Leere Aufnahme - bitte erneut versuchen.');
      }

      console.log('📤 Uploading audio:', audioBlob.size, 'bytes');

      // Send to webhook
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', 'de');

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📥 Received response:', result);

      // Extract transcript and response
      if (result.transcript) {
        setTranscript(result.transcript);
      }

      if (result.response) {
        setResponse(result.response);
      }

      // Play audio if available
      if (result.audio_base64) {
        await playAudio(result.audio_base64);
      } else if (result.audio_url) {
        await playAudioUrl(result.audio_url);
      }

      setStatus('success');
      toast({
        title: 'Antwort erhalten',
        description: 'Die KI-Antwort wurde erfolgreich geladen.',
      });
    } catch (error) {
      console.error('Error processing recording:', error);
      setStatus('error');
      
      toast({
        title: 'Fehler bei der Verarbeitung',
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.',
        variant: 'destructive',
      });
    }
  };

  const playAudio = async (base64Audio: string) => {
    try {
      setStatus('playing');
      
      // Convert base64 to blob
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);

      // Play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setStatus('success');
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setStatus('success');
        URL.revokeObjectURL(audioUrl);
        toast({
          title: 'Audio-Wiedergabe fehlgeschlagen',
          description: 'Die Antwort wird als Text angezeigt.',
        });
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setStatus('success');
    }
  };

  const playAudioUrl = async (audioUrl: string) => {
    try {
      setStatus('playing');
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setStatus('success');
      };

      audio.onerror = () => {
        setStatus('success');
        toast({
          title: 'Audio-Wiedergabe fehlgeschlagen',
          description: 'Die Antwort wird als Text angezeigt.',
        });
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setStatus('success');
    }
  };

  const reset = () => {
    setStatus('idle');
    setTranscript('');
    setResponse('');
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'recording': return 'from-red-500 to-red-700';
      case 'processing': return 'from-yellow-500 to-yellow-700';
      case 'playing': return 'from-blue-500 to-blue-700';
      case 'success': return 'from-green-500 to-green-700';
      case 'error': return 'from-red-600 to-red-800';
      default: return 'from-purple-600 to-purple-800';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'recording': return <Square className="h-8 w-8" />;
      case 'processing': return <Loader2 className="h-8 w-8 animate-spin" />;
      case 'playing': return <Volume2 className="h-8 w-8 animate-pulse" />;
      case 'success': return <CheckCircle2 className="h-8 w-8" />;
      case 'error': return <AlertCircle className="h-8 w-8" />;
      default: return <Mic className="h-8 w-8" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'recording': return 'Aufnahme läuft...';
      case 'processing': return 'Verarbeite Anfrage...';
      case 'playing': return 'Spielt Antwort ab...';
      case 'success': return 'Bereit für neue Anfrage';
      case 'error': return 'Fehler aufgetreten';
      default: return 'Bereit für Aufnahme';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Voice RAG Bot
            </CardTitle>
            <CardDescription className="text-lg">
              Stellen Sie Ihre Frage per Sprache und erhalten Sie eine KI-generierte Antwort
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Main Control Button */}
            <div className="flex flex-col items-center space-y-4">
              <Button
                onClick={status === 'recording' ? stopRecording : status === 'idle' ? startRecording : reset}
                disabled={status === 'processing' || status === 'playing'}
                size="lg"
                className={`w-32 h-32 rounded-full bg-gradient-to-br ${getStatusColor()} hover:opacity-90 transition-all shadow-2xl hover:scale-105 disabled:opacity-50 disabled:scale-100`}
              >
                {getStatusIcon()}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-xl font-semibold text-foreground">
                  {getStatusText()}
                </p>
                {status === 'recording' && (
                  <p className="text-2xl font-mono text-destructive">
                    {formatTime(recordingTime)}
                  </p>
                )}
              </div>
            </div>

            {/* Transcript Section */}
            {transcript && (
              <Card className="bg-muted/50 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mic className="h-5 w-5 text-primary" />
                    Ihre Frage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{transcript}"</p>
                </CardContent>
              </Card>
            )}

            {/* Response Section */}
            {response && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-primary" />
                    KI-Antwort
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">{response}</p>
                </CardContent>
              </Card>
            )}

            {/* Diagnostics (only shown in test mode) */}
            {window.location.search.includes('test=1') && (
              <Card className="bg-muted/30 border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    🔍 Diagnostics
                    <Button 
                      onClick={runDiagnostics} 
                      size="sm" 
                      variant="outline"
                      className="ml-auto"
                    >
                      Erneut prüfen
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm font-mono">
                  <div className="flex items-center justify-between">
                    <span>HTTPS:</span>
                    <span className={diagnostics.httpsEnabled ? 'text-green-600' : 'text-red-600'}>
                      {diagnostics.httpsEnabled ? '✅ Enabled' : '❌ Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Browser Support:</span>
                    <span className={diagnostics.browserSupported ? 'text-green-600' : 'text-red-600'}>
                      {diagnostics.browserSupported ? '✅ Supported' : '❌ Not Supported'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Microphone:</span>
                    <span className={diagnostics.microphoneAccess ? 'text-green-600' : 'text-yellow-600'}>
                      {diagnostics.microphoneAccess ? '✅ Access Granted' : '⏳ Not Yet Requested'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Webhook:</span>
                    <span className={
                      diagnostics.webhookReachable === null ? 'text-gray-600' :
                      diagnostics.webhookReachable ? 'text-green-600' : 'text-red-600'
                    }>
                      {diagnostics.webhookReachable === null ? '⏳ Not Tested' :
                       diagnostics.webhookReachable ? '✅ Reachable' : '❌ Unreachable'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="bg-card/50 border-border/30">
              <CardHeader>
                <CardTitle className="text-sm">Anleitung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Klicken Sie auf den Mikrofon-Button, um die Aufnahme zu starten</li>
                  <li>Stellen Sie Ihre Frage klar und deutlich</li>
                  <li>Klicken Sie erneut, um die Aufnahme zu beenden</li>
                  <li>Warten Sie auf die KI-Antwort (als Text und Audio)</li>
                  <li>Klicken Sie erneut, um eine neue Frage zu stellen</li>
                </ol>
                <p className="text-xs text-muted-foreground/70 pt-2">
                  💡 Tipp: Maximale Aufnahmezeit beträgt 90 Sekunden
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
