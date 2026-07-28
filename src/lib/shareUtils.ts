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

/**
 * Single clean capture pipeline using html-to-image to avoid multi-library CORS conflicts.
 */
export async function generateImagePng(element: HTMLElement): Promise<string> {
  if (!element) {
    throw new Error("L'élément de prévisualisation est introuvable.");
  }

  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      skipFonts: true,
      cacheBust: true,
      filter: (node) => {
        // Exclude elements with class 'no-capture'
        return !node.classList?.contains('no-capture');
      },
    });

    if (!dataUrl || dataUrl.length < 100) {
      throw new Error("Erreur lors de la création du fichier image.");
    }
    return dataUrl;
  } catch (err) {
    console.warn('html-to-image high-res capture failed, trying standard resolution:', err);
    try {
      return await toPng(element, {
        quality: 0.9,
        pixelRatio: 1,
        skipFonts: true,
        filter: (node) => !node.classList?.contains('no-capture'),
      });
    } catch (fallbackErr) {
      console.error('Final image generation error:', fallbackErr);
      throw new Error("Impossible de générer l'image. Veuillez réessayer.");
    }
  }
}

export function downloadImageDataUrl(dataUrl: string, filename: string) {
  if (!dataUrl) return;

  try {
    const arr = dataUrl.split(',');
    if (arr.length < 2) {
      throw new Error('Invalid dataUrl format');
    }
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch (err) {
    console.warn('Blob download failed, falling back to direct anchor download:', err);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export async function shareCardToStatus(options: ShareOptions): Promise<ShareResult> {
  const { element, filename, title, text, url } = options;

  const dataUrl = await generateImagePng(element);
  let blob: Blob | null = null;

  if (dataUrl) {
    try {
      const res = await fetch(dataUrl);
      blob = await res.blob();
    } catch (e) {
      console.warn('Failed to convert dataUrl to blob:', e);
    }
  }

  // Always copy profile link to clipboard
  let copiedLink = false;
  try {
    await navigator.clipboard.writeText(url);
    copiedLink = true;
  } catch (e) {
    console.warn('Could not copy link to clipboard:', e);
  }

  // Try Web Share API with image file if supported (iOS / Android Instagram Story flow)
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

  // Direct download PNG fallback for desktop or web browsers without file share
  if (dataUrl) {
    downloadImageDataUrl(dataUrl, filename);
  }

  return { sharedNatively: false, downloaded: !!dataUrl, copiedLink, dataUrl };
}
