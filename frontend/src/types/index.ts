export interface AnalyzedItem {
  id: string;
  type: 'image' | 'text' | 'audio';
  fileType: string;
  title: string;
  content: string;
  path: string;
  tags: string[];
  entities: string[];
  dateAnalyzed: string;
  confidence: number;
}

export interface Relationship {
  source: string;
  target: string;
  strength: number;
  commonTags: string[];
}

export interface FileItem {
  id: string;
  type: 'text' | 'audio' | 'image';
  content: string | null; // לתמונות לא יהיה תוכן טקסטואלי
  tags: string[];
  entities: string[];
}

export interface Case {
  id: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  entities?: Array<{ entity: string; type: string; color: string }>;
  confidence?: number;
  dateAnalyzed: string;
}
