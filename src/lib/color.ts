// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove the hash if present
  hex = hex.replace(/^#/, '');

  // Handle both 3-digit and 6-digit hex codes
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

// Calculate perceived brightness using YIQ formula
function getPerceivedBrightness(r: number, g: number, b: number): number {
  // Using YIQ formula which better represents human perception of brightness
  return (r * 299 + g * 587 + b * 114) / 1000;
}

// Get appropriate text color based on background
export function getTextColor(backgroundColor: string): string {
  // Convert rgba/rgb to hex if needed
  if (backgroundColor.startsWith('rgba') || backgroundColor.startsWith('rgb')) {
    // Extract values using regex
    const values = backgroundColor.match(/\d+/g);
    if (!values || values.length < 3) return '#000000';
    
    const r = parseInt(values[0]);
    const g = parseInt(values[1]);
    const b = parseInt(values[2]);
    
    backgroundColor = '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  // Remove any alpha channel for hex colors
  backgroundColor = backgroundColor.replace(/[^#\d\w]/g, '').slice(0, 7);
  
  const { r, g, b } = hexToRgb(backgroundColor);
  const brightness = getPerceivedBrightness(r, g, b);
  
  // Using YIQ formula threshold of 128 (half of max 255)
  // This formula is better at handling pastel and muted colors
  return brightness >= 128 ? '#000000' : '#FFFFFF';
} 