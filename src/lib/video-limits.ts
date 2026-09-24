// Tamanho máximo de um clipe de gol. Câmera de celular grava ~45–65MB por
// minuto (720p–1080p), então um lance de 15–20s fica entre 10 e 22MB; um
// vídeo repassado pelo WhatsApp (já comprimido) fica em 2–4MB. 30MB cobre o
// lance sem deixar um vídeo longo ou em 4K esgotar o armazenamento.
// Validado no celular (antes de enviar) e no servidor.
export const VIDEO_MAX_MB = 30;
export const VIDEO_MAX_BYTES = VIDEO_MAX_MB * 1024 * 1024;
