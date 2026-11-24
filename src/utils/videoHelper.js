/**
 * Video Parser & Stream Router for Cheap Reels Store
 * Converts Google Drive video links and direct MP4s into clean, native, 
 * zero-overlay HTML5 video streams with NO Google Drive controls or redirect links.
 */

export function parseVideoUrl(url) {
  const clean = (url && typeof url === 'string') ? url.trim() : '';

  if (!clean || /^(javascript|data|vbscript):/i.test(clean)) {
    return {
      type: 'none',
      hasVideo: false,
      url: ''
    };
  }

  // Exclude image files and folders from being treated as demo videos
  const isImageFile = clean.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i);
  const isFolderLink = clean.includes('/drive/folders/');

  if (isImageFile || isFolderLink) {
    return {
      type: 'none',
      hasVideo: false,
      url: ''
    };
  }

  // 1. Google Drive Video Link (file/d, open?id, uc?id, download?id)
  const gdriveMatch = clean.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|drive\.usercontent\.google\.com\/download\?id=)([a-zA-Z0-9_-]+)/);
  if (gdriveMatch && gdriveMatch[1]) {
    const fileId = gdriveMatch[1];
    return {
      type: 'direct',
      hasVideo: true,
      fileId,
      url: `/api/video?id=${fileId}`,
      directStreamUrl: `https://drive.usercontent.google.com/download?id=${fileId}&export=download`,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`
    };
  }

  // 2. Direct MP4 / WebM / Stream / Local Video
  if (clean.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i) || clean.startsWith('blob:') || clean.startsWith('/videos/')) {
    return {
      type: 'direct',
      hasVideo: true,
      url: clean
    };
  }

  // 3. Fallback for external video embeds (YouTube / Vimeo)
  if (clean.includes('youtube') || clean.includes('vimeo') || clean.includes('stream')) {
    return {
      type: 'iframe',
      hasVideo: true,
      url: clean
    };
  }

  return {
    type: 'none',
    hasVideo: false,
    url: ''
  };
}
