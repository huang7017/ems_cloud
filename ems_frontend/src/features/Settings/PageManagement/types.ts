export interface Page {
  id: number;
  parent: number;
  title: string;
  url: string;
  icon: string;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageManagementState {
  pages: Page[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedPage: Page | null;
  isDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
}

export interface FetchPagesResponse {
  pages: Page[];
}

export interface CreatePageRequest {
  parent: number;
  title: string;
  url: string;
  icon: string;
  order?: number;
}

export interface UpdatePageRequest {
  id: number;
  parent?: number;
  title?: string;
  url?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

export interface DeletePageRequest {
  id: number;
}

export interface PageTreeItem extends Page {
  children: PageTreeItem[];
  level: number;
}
