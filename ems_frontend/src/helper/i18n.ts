// 翻譯數據
const translations = {
  en: {
    user_management: "User Management",
    search_users: "Search users...",
    add_user: "Add User",
    add_role: "Add Role",
    edit: "Edit",
    users: "Users",
    roles: "Roles",
    access: "Access",
    user_management_tab: "User Management",
    role_permissions_tab: "Role Permissions",
    access_records_tab: "Access Records",
    username: "Username",
    email: "Email",
    role: "Role",
    status: "Status",
    last_login: "Last Login",
    actions: "Actions",
    enabled: "● Enabled",
    disabled: "● Disabled",
    administrator: "Administrator",
    user: "User",
    category: "Category",
    permissions: "Permissions",
    // User Management
    manage_user_permissions: "Manage users and permissions in the system",
    // Page Management
    page_management: "Page Management",
    search_pages: "Search pages...",
    add_page: "Add Page",
    edit_page: "Edit Page",
    page_list: "Page List",
    total_pages: "Total {count} pages",
    parent_page: "Parent Page",
    title: "Title",
    url: "URL",
    icon: "Icon",
    order: "Order",
    enable: "Enable",
    cancel: "Cancel",
    update: "Update",
    delete: "Delete",
    confirm_delete: "Confirm Delete",
    confirm_delete_page: 'Are you sure you want to delete page "{title}"?',
    delete_warning:
      "This action cannot be undone and will delete all child pages.",
    title_required: "Title cannot be empty",
    url_required: "URL cannot be empty",
    url_must_start_with_slash: "URL must start with /",
    url_placeholder: "/example-page or /device/info/:id",
    url_help_text: "Use :id for dynamic parameters (e.g., /device/info/:id)",
    url_invalid_format:
      "Invalid URL format. Only letters, numbers, slashes, hyphens, colons and underscores are allowed",
    order_must_be_positive: "Order must be greater than 0",
    order_info: "Order: {order} | Updated: {updatedAt}",
    manage_page_structure: "Manage page structure and navigation in the system",
  },
  ch: {
    user_management: "用戶管理",
    search_users: "搜尋用戶...",
    add_user: "新增用戶",
    add_role: "新增角色",
    edit: "編輯",
    users: "用戶",
    roles: "角色",
    access: "存取",
    user_management_tab: "用戶管理",
    role_permissions_tab: "角色權限",
    access_records_tab: "存取記錄",
    username: "用戶名稱",
    email: "電子郵件",
    role: "角色",
    status: "狀態",
    last_login: "最後登入",
    actions: "操作",
    enabled: "● 啟用中",
    disabled: "● 停用中",
    administrator: "管理員",
    user: "用戶",
    category: "分類",
    permissions: "權限",
    // User Management
    manage_user_permissions: "管理系統中的用戶和權限",
    // Page Management
    page_management: "分頁管理",
    search_pages: "搜尋分頁...",
    add_page: "新增分頁",
    edit_page: "編輯分頁",
    page_list: "分頁列表",
    total_pages: "共 {count} 個分頁",
    parent_page: "父分頁",
    title: "標題",
    url: "URL",
    icon: "圖示",
    order: "排序",
    enable: "啟用",
    cancel: "取消",
    update: "更新",
    delete: "刪除",
    confirm_delete: "確認刪除",
    confirm_delete_page: '您確定要刪除分頁 "{title}" 嗎？',
    delete_warning: "此操作無法撤銷，且會同時刪除所有子分頁。",
    title_required: "標題不能為空",
    url_required: "URL不能為空",
    url_must_start_with_slash: "URL必須以/開頭",
    url_placeholder: "/example-page 或 /device/info/:id",
    url_help_text: "使用 :id 表示動態參數 (例如: /device/info/:id)",
    url_invalid_format:
      "URL 格式不正確，只允許字母、數字、斜線、連字符、冒號和下劃線",
    order_must_be_positive: "排序必須大於0",
    order_info: "排序: {order} | 更新時間: {updatedAt}",
    manage_page_structure: "管理系統中的分頁結構和導航",
  },
  fr: {
    user_management: "Gestion des utilisateurs",
    search_users: "Rechercher des utilisateurs...",
    add_user: "Ajouter un utilisateur",
    add_role: "Ajouter un rôle",
    edit: "Modifier",
    users: "Utilisateurs",
    roles: "Rôles",
    access: "Accès",
    user_management_tab: "Gestion des utilisateurs",
    role_permissions_tab: "Permissions des rôles",
    access_records_tab: "Enregistrements d'accès",
    username: "Nom d'utilisateur",
    email: "E-mail",
    role: "Rôle",
    status: "Statut",
    last_login: "Dernière connexion",
    actions: "Actions",
    enabled: "● Activé",
    disabled: "● Désactivé",
    administrator: "Administrateur",
    user: "Utilisateur",
    category: "Catégorie",
    permissions: "Permissions",
    // User Management
    manage_user_permissions:
      "Gérer les utilisateurs et les permissions dans le système",
    // Page Management
    page_management: "Gestion des pages",
    search_pages: "Rechercher des pages...",
    add_page: "Ajouter une page",
    edit_page: "Modifier la page",
    page_list: "Liste des pages",
    total_pages: "Total de {count} pages",
    parent_page: "Page parent",
    title: "Titre",
    url: "URL",
    icon: "Icône",
    order: "Ordre",
    enable: "Activer",
    cancel: "Annuler",
    update: "Mettre à jour",
    delete: "Supprimer",
    confirm_delete: "Confirmer la suppression",
    confirm_delete_page:
      'Êtes-vous sûr de vouloir supprimer la page "{title}" ?',
    delete_warning:
      "Cette action ne peut pas être annulée et supprimera toutes les pages enfants.",
    title_required: "Le titre ne peut pas être vide",
    url_required: "L'URL ne peut pas être vide",
    url_must_start_with_slash: "L'URL doit commencer par /",
    url_placeholder: "/exemple-page ou /device/info/:id",
    url_help_text:
      "Utilisez :id pour les paramètres dynamiques (ex: /device/info/:id)",
    url_invalid_format:
      "Format d'URL invalide. Seules les lettres, chiffres, barres obliques, tirets, deux-points et tirets bas sont autorisés",
    order_must_be_positive: "L'ordre doit être supérieur à 0",
    order_info: "Ordre: {order} | Mis à jour: {updatedAt}",
    manage_page_structure:
      "Gérer la structure des pages et la navigation dans le système",
  },
  ar: {
    user_management: "إدارة المستخدمين",
    search_users: "البحث عن المستخدمين...",
    add_user: "إضافة مستخدم",
    add_role: "إضافة دور",
    edit: "تعديل",
    users: "المستخدمون",
    roles: "الأدوار",
    access: "الوصول",
    user_management_tab: "إدارة المستخدمين",
    role_permissions_tab: "صلاحيات الأدوار",
    access_records_tab: "سجلات الوصول",
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    role: "الدور",
    status: "الحالة",
    last_login: "آخر تسجيل دخول",
    actions: "الإجراءات",
    enabled: "● مفعل",
    disabled: "● معطل",
    administrator: "مدير",
    user: "مستخدم",
    category: "الفئة",
    permissions: "الصلاحيات",
    // User Management
    manage_user_permissions: "إدارة المستخدمين والصلاحيات في النظام",
    // Page Management
    page_management: "إدارة الصفحات",
    search_pages: "البحث عن الصفحات...",
    add_page: "إضافة صفحة",
    edit_page: "تعديل الصفحة",
    page_list: "قائمة الصفحات",
    total_pages: "إجمالي {count} صفحة",
    parent_page: "الصفحة الأصل",
    title: "العنوان",
    url: "الرابط",
    icon: "الأيقونة",
    order: "الترتيب",
    enable: "تفعيل",
    cancel: "إلغاء",
    update: "تحديث",
    delete: "حذف",
    confirm_delete: "تأكيد الحذف",
    confirm_delete_page: 'هل أنت متأكد من حذف الصفحة "{title}"؟',
    delete_warning:
      "لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع الصفحات الفرعية.",
    title_required: "العنوان لا يمكن أن يكون فارغًا",
    url_required: "الرابط لا يمكن أن يكون فارغًا",
    url_must_start_with_slash: "يجب أن يبدأ الرابط بـ /",
    url_placeholder: "/example-page أو /device/info/:id",
    url_help_text: "استخدم :id للمعاملات الديناميكية (مثل: /device/info/:id)",
    url_invalid_format:
      "تنسيق الرابط غير صحيح. يُسمح فقط بالحروف والأرقام والشرطات والشرطات المائلة والنقطتين والشرطات السفلية",
    order_must_be_positive: "يجب أن يكون الترتيب أكبر من 0",
    order_info: "الترتيب: {order} | تم التحديث: {updatedAt}",
    manage_page_structure: "إدارة هيكل الصفحات والتنقل في النظام",
  },
};

// 獲取當前語言
export const getCurrentLanguage = (): string => {
  // 從localStorage或Redux store獲取語言設定
  return localStorage.getItem("language") || "en";
};

// 翻譯函數
export const t = (
  key: string,
  language?: string,
  params?: Record<string, string | number>
): string => {
  const currentLang = language || getCurrentLanguage();
  const langTranslations =
    translations[currentLang as keyof typeof translations] || translations.en;
  let translation =
    langTranslations[key as keyof typeof langTranslations] || key;

  // 替換參數
  if (params) {
    Object.keys(params).forEach((param) => {
      translation = translation.replace(
        new RegExp(`{${param}}`, "g"),
        String(params[param])
      );
    });
  }

  return translation;
};

// 設置語言
export const setLanguage = (language: string): void => {
  localStorage.setItem("language", language);
};

// 獲取支持的语言列表
export const getSupportedLanguages = () => {
  return Object.keys(translations);
};
