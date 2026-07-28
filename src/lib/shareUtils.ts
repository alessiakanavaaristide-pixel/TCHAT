import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';

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
  // Method 1: Try html2canvas (Most reliable across mobile browsers and CORS)
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      ignoreElements: (node) => node.classList?.contains('no-capture'),
    });
    const dataUrl = canvas.toDataURL('image/png', 0.98);
    if (dataUrl && dataUrl.length > 100) {
      return dataUrl;
    }
  } catch (err) {
    console.warn('html2canvas capture failed, trying html-to-image:', err);
  }

  // Method 2: Try html-to-image as fallback
  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      skipFonts: true,
      cacheBust: true,
    });
    if (dataUrl && dataUrl.length > 100) {
      return dataUrl;
    }
  } catch (err2) {
    console.warn('High-res html-to-image failed, trying simple html-to-image:', err2);
  }

  // Method 3: Low-res html-to-image retry
  try {
    return await toPng(element, {
      quality: 0.85,
      pixelRatio: 1,
      skipFonts: true,
    });
  } catch (err3) {
    console.error('All image capture methods failed:', err3);
    return '';
  }
}

export function downloadImageDataUrl(dataUrl: string, filename: string) {
  if (!dataUrl) return;

  try {
    // Convert base64 dataUrl to Blob for max browser & mobile compatibility
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

    // Clean up object URL after a short delay
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

  // Fallback: Trigger browser download link using blob URL
  if (dataUrl) {
    downloadImageDataUrl(dataUrl, filename);
  }

  return { sharedNatively: false, downloaded: !!dataUrl, copiedLink, dataUrl };
}

