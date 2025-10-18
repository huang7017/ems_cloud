import axios from "../helper/axios";
import type { AxiosError } from "../helper/axios";

export interface MenuItem {
  id: number;
  parent: number;
  title: string;
  url: string;
  icon: string;
  sort: number;
  is_enable: boolean;
  is_show: boolean;
}

export interface MenuApiResponse {
  success: boolean;
  data: MenuItem[];
  error?: string;
}


export const fetchSideBarApi = async (): Promise<MenuApiResponse> => {
  try {
    console.log("Fetching menus from:", "/menu");

    const response = await axios.get<MenuApiResponse>("/menu/sidebar");

    console.log("Menu response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Menu API Error:", error);
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError;
      console.error("Response status:", axiosError.response?.status);
      console.error("Response data:", axiosError.response?.data);
    }
    throw new Error("Failed to fetch menus");
  }
};

export const fetchMenusApi = async (): Promise<MenuApiResponse> => {
  try {
    console.log("Fetching menus from:", "/menu");

    const response = await axios.get<MenuApiResponse>("/menu");

    console.log("Menu response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Menu API Error:", error);
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError;
      console.error("Response status:", axiosError.response?.status);
      console.error("Response data:", axiosError.response?.data);
    }
    throw new Error("Failed to fetch menus");
  }
};

export const createMenuApi = async (
  menuData: Omit<MenuItem, "id">
): Promise<MenuApiResponse> => {
  try {
    const response = await axios.post<MenuApiResponse>("/menu", menuData);
    return response.data;
  } catch (error) {
    console.error("Create menu API Error:", error);
    throw new Error("Failed to create menu");
  }
};

export const updateMenuApi = async (
  id: number,
  menuData: Partial<MenuItem>
): Promise<MenuApiResponse> => {
  try {
    const response = await axios.put<MenuApiResponse>(`/menu/${id}`, menuData);
    return response.data;
  } catch (error) {
    console.error("Update menu API Error:", error);
    throw new Error("Failed to update menu");
  }
};

export const deleteMenuApi = async (id: number): Promise<MenuApiResponse> => {
  try {
    const response = await axios.delete<MenuApiResponse>(`/menu/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete menu API Error:", error);
    throw new Error("Failed to delete menu");
  }
};
