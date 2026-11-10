/**
 * Synchronous, universal clipboard copy for mobile and desktop.
 * Specially engineered for iOS Safari and Android Chrome over HTTP (non-secure context).
 */
export function copyToClipboard(text) {
  if (!text) return false;

  // 1. Try modern Clipboard API if supported and secure
  if (typeof window !== 'undefined' && window.isSecureContext && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Continue to synchronous fallback
    }
  }

  // 2. Synchronous execCommand fallback
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // CRITICAL FOR IOS SAFARI:
    // DO NOT set readonly! WebKit disables copy on readonly inputs.
    textArea.contentEditable = 'true';
    textArea.readOnly = false;

    // Position within viewport to avoid being rejected as "hidden / untrusted"
    textArea.style.position = 'fixed';
    textArea.style.top = '10px';
    textArea.style.left = '10px';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.color = 'transparent';
    textArea.style.fontSize = '16px'; // Prevents auto-zoom on iOS
    textArea.style.zIndex = '99999';

    document.body.appendChild(textArea);

    const isIOS = navigator.userAgent.match(/ipad|ipod|iphone/i);
    if (isIOS) {
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      textArea.setSelectionRange(0, 999999);
    } else {
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, textArea.value.length);
    }

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      return true;
    }
  } catch (err) {
    console.error('execCommand copy error:', err);
  }

  return false;
}
