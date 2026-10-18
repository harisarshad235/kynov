export type DocItemType =
  | 'folder'
  | 'google_sheet'
  | 'markdown'
  | 'file_pdf'
  | 'file_image'
  | 'file_generic';

export interface DocItemCreator {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface DocItemFileMetadata {
  fileUrl: string;
  fileSize: number; // in bytes
  mimeType: string;
  thumbnailUrl?: string;
  pageCount?: number;
}

export interface DocItemGoogleSheetMetadata {
  spreadsheetUrl: string;
  sheetName?: string;
  embedUrl: string; // Sanitized preview/embed URL
  sheetId: string;
  gid?: string;
  isPublic?: boolean;
}

export interface DocItem {
  id: string;
  name: string;
  description?: string;
  type: DocItemType;
  parentId: string | null; // null for root level
  createdAt: string;
  updatedAt: string;
  createdBy: DocItemCreator;
  sprintId?: string; // Optional sprint association
  sprintName?: string;
  tags?: string[];
  
  // Specific payloads based on type
  fileMetadata?: DocItemFileMetadata;
  googleSheetMetadata?: DocItemGoogleSheetMetadata;
  content?: string; // Markdown or raw document content
  
  // Computed / meta
  itemCount?: number; // for folders: count of direct children
  starred?: boolean;
}

export interface DocFolderNode {
  id: string;
  name: string;
  parentId: string | null;
  children: DocFolderNode[];
  itemCount: number;
}

export type DocFilterType =
  | 'ALL'
  | 'GOOGLE_SHEET'
  | 'DOCS'
  | 'IMAGES'
  | 'SPRINT_LINKED';

export type DocViewMode = 'grid' | 'table';

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}
