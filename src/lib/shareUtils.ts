import { toPng } from 'html-to-image';

export interface ShareOptions {
  element: HTMLDivElement;
  filename: string;
  title: string;
  text: string;
  url: string;
}

export interface ShareResult {
  sharedNatively: boolean;
  downloaded: boolean;
  copiedLink: boolean;
  dataUrl: string;
}

export async function generateImagePng(element: HTMLElement): Promise<string> {
  // Try high quality capture with skipFonts to avoid CORS crashes
  try {
    return await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      skipFonts: true,
      cacheBust: true,
    });
  } catch (err) {
    console.warn('High-res PNG capture failed, retrying simple capture:', err);
  }

  // Fallback capture
  try {
    return await toPng(element, {
      quality: 0.9,
      pixelRatio: 1.5,
      skipFonts: true,
    });
  } catch (err2) {
    console.error('All PNG capture attempts failed:', err2);
    return '';
  }
}

export async function shareCardToStatus(options: ShareOptions): Promise<ShareResult> {
  const { element, filename, title, text, url } = options;

  let dataUrl = await generateImagePng(element);
  let blob: Blob | null = null;

  if (dataUrl) {
    try {
      const res = await fetch(dataUrl);
      blob = await res.blob();
    } catch (e) {
      console.warn('Failed to convert dataUrl to blob:', e);
    }
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
        return { sharedNatively: true, downloaded: false, copiedLink, dataUrl };
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          return { sharedNatively: false, downloaded: false, copiedLink, dataUrl };
        }
      }
    }
  }

  // Fallback: Trigger browser download link
  if (dataUrl) {
    try {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (dlErr) {
      console.warn('Download link click failed:', dlErr);
    }
  }

  return { sharedNatively: false, downloaded: !!dataUrl, copiedLink, dataUrl };
}
