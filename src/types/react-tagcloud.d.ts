declare module 'react-tagcloud' {
  export interface TagCloudOptions {
    luminosity?: 'light' | 'dark';
    hue?: string;
    minSize?: number;
    maxSize?: number;
    shuffle?: boolean;
    randomSeed?: number;
  }

  export interface Tag {
    value: number;
    text: string;
    key?: string;
    count?: number;
  }

  export interface TagCloudProps {
    tags: Tag[];
    minSize?: number;
    maxSize?: number;
    shuffle?: boolean;
    onClick?: (tag: Tag, event: MouseEvent) => void;
    className?: string;
    colorOptions?: TagCloudOptions;
  }

  export const TagCloud: React.FC<TagCloudProps>;
} 