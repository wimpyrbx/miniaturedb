export function getMiniatureImagePath(miniId: number, type: 'original' | 'thumb'): string {
  const idStr = miniId.toString();
  const firstDigit = idStr[0];
  const secondDigit = idStr.length > 1 ? idStr[1] : '0';
  
  return `/images/miniatures/${type}/${firstDigit}/${secondDigit}/${miniId}.webp`;
}

export interface ImageStatus {
  hasOriginal: boolean;
  hasThumb: boolean;
}

export async function checkMiniatureImageStatus(miniId: number): Promise<ImageStatus> {
  try {
    const response = await fetch(`/api/minis/${miniId}/image`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to check image status');
    return await response.json();
  } catch (error) {
    console.error('Error checking image status:', error);
    return { hasOriginal: false, hasThumb: false };
  }
}

export async function uploadMiniatureImage(miniId: number, file: File): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`/api/minis/${miniId}/image`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    if (!response.ok) throw new Error('Failed to upload image');
    return true;
  } catch (error) {
    console.error('Error uploading image:', error);
    return false;
  }
}

export async function deleteMiniatureImage(miniId: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/minis/${miniId}/image`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to delete image');
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
} 