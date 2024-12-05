export interface UserSettings {
  colormode?: 'light' | 'dark';
  colortheme?: string;
  styletheme?: string;
  miniatures_view_type?: 'table' | 'cards' | 'banner' | 'timeline';
  miniatures_view_last_page_visited?: string;
  miniatures_view_last_filter_text?: string;
  [key: string]: any;
} 