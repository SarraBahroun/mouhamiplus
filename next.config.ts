import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // L'OCR envoie chaque page en JPEG base64 à l'action de transcription — une photo
      // de téléphone encodée dépasse largement la limite par défaut de 1 Mo.
      bodySizeLimit: '8mb',
    },
  },
};

export default nextConfig;
