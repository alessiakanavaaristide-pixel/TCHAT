import { toPng } from 'html-to-image';

export interface ShareOptions {
  element: HTMLDivElement;
  filename: string;
  title: string;
  text: string;
  url: string;
}

export async function shareCardToStatus(options: ShareOptions): Promise<{
  sharedNatively: boolean;
  downloaded: boolean;
  copiedLink: boolean;
}> {
  const { element, filename, title, text, url } = options;

  let blob: Blob | null = null;
  let dataUrl = '';

  try {
    dataUrl = await toPng(element, { quality: 0.95, cacheBust: true });
    const res = await fetch(dataUrl);
    blob = await res.blob();
  } catch (err) {
    console.warn('Failed to capture PNG:', err);
  }

  // Always copy link to clipboard
  let copiedLink = false;
  try {
    await navigator.clipboard.writeText(url);
    copiedLink = true;
  } catch (e) {
    console.warn('Could not copy link to clipboard:', e);
  }

  // Try Web Share API with image file if supported
  if (blob && navigator.canShare && navigator.share) {
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: title,
          text: `${text}\n${url}`,
        });
        return { sharedNatively: true, downloaded: false, copiedLink };
      } catch (shareErr: any) {
        // User cancelled share or browser refused file share
        if (shareErr.name === 'AbortError') {
          return { sharedNatively: false, downloaded: false, copiedLink };
        }
      }
    }
  }

  // Fallback: Download image file & open WhatsApp
  if (dataUrl) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return { sharedNatively: false, downloaded: true, copiedLink };
}
