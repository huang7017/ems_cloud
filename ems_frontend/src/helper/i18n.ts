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
  },
};

// 獲取當前語言
export const getCurrentLanguage = (): string => {
  // 從localStorage或Redux store獲取語言設定
  return localStorage.getItem("language") || "en";
};

// 翻譯函數
export const t = (key: string, language?: string): string => {
  const currentLang = language || getCurrentLanguage();
  const langTranslations =
    translations[currentLang as keyof typeof translations] || translations.en;
  return langTranslations[key as keyof typeof langTranslations] || key;
};

// 設置語言
export const setLanguage = (language: string): void => {
  localStorage.setItem("language", language);
};

// 獲取支持的语言列表
export const getSupportedLanguages = () => {
  return Object.keys(translations);
};
