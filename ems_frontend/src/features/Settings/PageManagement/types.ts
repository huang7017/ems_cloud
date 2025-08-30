export interface Page {
  id: number;
  parent: number;
  title: string;
  url: string;
  icon: string;
  sort: number;
  is_enable: boolean;
  is_show: boolean;
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
  sort: number;
  is_enable: boolean;
  is_show: boolean;
}

export interface UpdatePageRequest {
  id: number;
  parent?: number;
  title?: string;
  url?: string;
  icon?: string;
  sort?: number;
  is_enable?: boolean;
  is_show?: boolean;
}

export interface DeletePageRequest {
  id: number;
}

export interface PageTreeItem extends Page {
  children: PageTreeItem[];
  level: number;
}
