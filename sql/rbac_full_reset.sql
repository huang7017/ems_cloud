-- ===================================================
-- RBAC 完整重建腳本
-- 基於現有角色: SystemAdmin (id=1), company_manager (id=2)
-- ===================================================

-- ===================================================
-- 第一部分：清理權限數據（保留角色）
-- ===================================================
TRUNCATE TABLE role_power CASCADE;
DELETE FROM power;

-- 重置序列
ALTER SEQUENCE power_id_seq RESTART WITH 1;
ALTER SEQUENCE role_power_id_seq RESTART WITH 1;

-- ===================================================
-- 第二部分：確保 member_id=1 屬於 SystemAdmin 角色
-- ===================================================
-- member_role 只有 id, role_id, member_id 三個欄位
INSERT INTO member_role (role_id, member_id)
SELECT 1, 1
WHERE NOT EXISTS (
    SELECT 1 FROM member_role WHERE member_id = 1 AND role_id = 1
);

-- ===================================================
-- 第三部分：為每個菜單創建權限
-- ===================================================
DO $$
DECLARE
    menu_record RECORD;
BEGIN
    FOR menu_record IN SELECT id, title, url FROM menu WHERE id IS NOT NULL LOOP
        RAISE NOTICE 'Processing menu: % (ID: %, URL: %)', menu_record.title, menu_record.id, menu_record.url;

        -- 菜單管理權限
        IF menu_record.url LIKE '%menu%' OR menu_record.title LIKE '%菜單%' OR menu_record.title LIKE '%選單%' THEN
            INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
            VALUES
                (menu_record.id, '查看菜單', 'menu:read', '查看菜單列表', 1, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '新增菜單', 'menu:create', '新增菜單項目', 2, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '編輯菜單', 'menu:update', '編輯菜單項目', 3, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '刪除菜單', 'menu:delete', '刪除菜單項目', 4, true, 1, NOW(), 1, NOW());
        END IF;

        -- 用戶管理權限
        IF menu_record.url LIKE '%user%' OR menu_record.title LIKE '%用戶%' OR menu_record.title LIKE '%成員%' THEN
            INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
            VALUES
                (menu_record.id, '查看用戶', 'member:read', '查看用戶列表', 1, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '新增用戶', 'member:create', '新增用戶', 2, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '編輯用戶', 'member:update', '編輯用戶資料', 3, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '更新用戶狀態', 'member:update_status', '啟用/停用用戶', 4, true, 1, NOW(), 1, NOW());
        END IF;

        -- 角色管理權限
        IF menu_record.url LIKE '%role%' OR menu_record.title LIKE '%角色%' THEN
            INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
            VALUES
                (menu_record.id, '查看角色', 'role:read', '查看角色列表', 1, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '新增角色', 'role:create', '新增角色', 2, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '編輯角色', 'role:update', '編輯角色', 3, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '刪除角色', 'role:delete', '刪除角色', 4, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '分配權限', 'role:assign_powers', '分配角色權限', 5, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '移除權限', 'role:remove_powers', '移除角色權限', 6, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '分配成員', 'role:assign_members', '分配角色成員', 7, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '移除成員', 'role:remove_members', '移除角色成員', 8, true, 1, NOW(), 1, NOW());
        END IF;

        -- 權限管理權限
        IF menu_record.url LIKE '%power%' OR menu_record.title LIKE '%權限%' THEN
            INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
            VALUES
                (menu_record.id, '查看權限', 'power:read', '查看權限列表', 1, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '新增權限', 'power:create', '新增權限', 2, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '編輯權限', 'power:update', '編輯權限', 3, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '刪除權限', 'power:delete', '刪除權限', 4, true, 1, NOW(), 1, NOW());
        END IF;

        -- 設備管理權限
        IF menu_record.url LIKE '%device%' OR menu_record.title LIKE '%設備%' THEN
            INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
            VALUES
                (menu_record.id, '查看設備', 'device:read', '查看設備列表', 1, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '新增設備', 'device:create', '新增設備', 2, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '編輯設備', 'device:update', '編輯設備', 3, true, 1, NOW(), 1, NOW()),
                (menu_record.id, '刪除設備', 'device:delete', '刪除設備', 4, true, 1, NOW(), 1, NOW());
        END IF;

    END LOOP;

    RAISE NOTICE 'All powers created successfully';
END $$;

-- ===================================================
-- 第四部分：將所有權限分配給 SystemAdmin (role_id=1)
-- ===================================================

-- 分配所有具體權限
INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
SELECT
    1,           -- SystemAdmin role_id
    p.menu_id,
    p.id,
    1, NOW(), 1, NOW()
FROM power p
WHERE NOT EXISTS (
    SELECT 1 FROM role_power rp WHERE rp.role_id = 1 AND rp.power_id = p.id
);

-- 分配所有菜單訪問權限 (power_id = NULL)
INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
SELECT
    1,           -- SystemAdmin role_id
    m.id,
    NULL,        -- NULL 表示菜單訪問權限
    1, NOW(), 1, NOW()
FROM menu m
WHERE NOT EXISTS (
    SELECT 1 FROM role_power rp WHERE rp.role_id = 1 AND rp.menu_id = m.id AND rp.power_id IS NULL
);

-- ===================================================
-- 第五部分：驗證結果
-- ===================================================
SELECT '=== 現有角色 ===' as section;
SELECT id, title, is_enable FROM role ORDER BY id;

SELECT '=== 已創建的權限 ===' as section;
SELECT id, menu_id, code, title FROM power ORDER BY menu_id, id;

SELECT '=== SystemAdmin 擁有的權限數量 ===' as section;
SELECT
    COUNT(*) FILTER (WHERE power_id IS NOT NULL) as permission_count,
    COUNT(*) FILTER (WHERE power_id IS NULL) as menu_access_count
FROM role_power
WHERE role_id = 1;

SELECT '=== SystemAdmin 的完整權限列表 ===' as section;
SELECT
    m.title as menu_name,
    COALESCE(p.code, '(菜單訪問)') as permission_code,
    COALESCE(p.title, '可訪問此菜單') as permission_name
FROM role_power rp
JOIN menu m ON rp.menu_id = m.id
LEFT JOIN power p ON rp.power_id = p.id
WHERE rp.role_id = 1
ORDER BY m.id, p.id NULLS FIRST;

SELECT '=== member_id=1 的角色 ===' as section;
SELECT m.id, m.name, m.email, r.id as role_id, r.title as role_name
FROM member m
JOIN member_role mr ON m.id = mr.member_id
JOIN role r ON mr.role_id = r.id
WHERE m.id = 1;
