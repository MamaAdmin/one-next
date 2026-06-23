const WEBHOOK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-rag`;

export async function checkVoiceRagWebhook(): Promise<Response> {
  return fetch(WEBHOOK_URL, { method: 'HEAD' });
}

export async function uploadVoiceRagAudio(
  audioBlob: Blob,
  language: string = 'de'
): Promise<Response> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('language', language);

  return fetch(WEBHOOK_URL, {
    method: 'POST',
    body: formData,
  });
}
