 -- ============================================
-- RBAC 系統菜單項和權限
-- 此腳本為角色管理、權限管理添加菜單項和權限
-- ============================================

-- 注意：這個腳本假設 setting 菜單（ID=1）已經存在
-- 如果不存在，請先執行 database.sql

-- ============================================
-- 1. 添加權限管理菜單項
-- ============================================
INSERT INTO menu (title, icon, url, parent, description, sort, is_enable, is_show, create_id, create_time, modify_id, modify_time)
VALUES ('權限管理', 'SecurityIcon', '/power', 1, '權限管理', 5, true, true, 1, NOW(), 1, NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. 為權限管理菜單創建權限
-- ============================================
-- 獲取剛創建的權限管理菜單的ID（假設是最新的）
DO $$
DECLARE
    power_menu_id INT;
BEGIN
    -- 獲取權限管理菜單ID
    SELECT id INTO power_menu_id FROM menu WHERE title = '權限管理' AND parent = 1 ORDER BY id DESC LIMIT 1;

    -- 如果找到了權限管理菜單，則創建權限
    IF power_menu_id IS NOT NULL THEN
        -- 查看權限
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (power_menu_id, '查看', 'power:query', '查看權限列表', 1, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- 創建權限
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (power_menu_id, '創建', 'power:create', '創建新權限', 2, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- 更新權限
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (power_menu_id, '更新', 'power:update', '更新權限信息', 3, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- 刪除權限
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (power_menu_id, '刪除', 'power:delete', '刪除權限', 4, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================
-- 3. 為角色管理菜單創建權限
-- ============================================
DO $$
DECLARE
    role_menu_id INT;
BEGIN
    -- 獲取角色管理菜單ID（應該已經存在，ID=4）
    SELECT id INTO role_menu_id FROM menu WHERE title = '角色管理' OR title = 'role' LIMIT 1;

    -- 如果找到了角色管理菜單，則創建權限
    IF role_menu_id IS NOT NULL THEN
        -- 查看權限
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (role_menu_id, '查看', 'role:query', '查看角色列表', 1, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- 創建權限
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (role_menu_id, '創建', 'role:create', '創建新角色', 2, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- 更新權限
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (role_menu_id, '更新', 'role:update', '更新角色信息', 3, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- 刪除權限
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (role_menu_id, '刪除', 'role:delete', '刪除角色', 4, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- 分配權限
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (role_menu_id, '分配權限', 'role:assign_powers', '為角色分配權限', 5, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- 分配成員
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (role_menu_id, '分配成員', 'role:assign_members', '為角色分配成員', 6, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================
-- 4. 為菜單管理添加權限（如果還沒有）
-- ============================================
DO $$
DECLARE
    menu_menu_id INT;
BEGIN
    -- 獲取菜單管理菜單ID（應該已經存在，ID=2）
    SELECT id INTO menu_menu_id FROM menu WHERE title = '選單管理' OR title = 'menu' LIMIT 1;

    IF menu_menu_id IS NOT NULL THEN
        -- 查看權限
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (menu_menu_id, '查看', 'menu:query', '查看菜單列表', 1, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- 創建權限
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (menu_menu_id, '創建', 'menu:create', '創建新菜單', 2, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- 更新權限
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (menu_menu_id, '更新', 'menu:update', '更新菜單信息', 3, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- 刪除權限
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (menu_menu_id, '刪除', 'menu:delete', '刪除菜單', 4, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================
-- 5. 為 SystemAdmin 角色分配所有權限
-- ============================================
DO $$
DECLARE
    admin_role_id INT;
    power_rec RECORD;
    menu_rec RECORD;
BEGIN
    -- 獲取 SystemAdmin 角色ID（應該是1）
    SELECT id INTO admin_role_id FROM role WHERE title = 'SystemAdmin' LIMIT 1;

    IF admin_role_id IS NOT NULL THEN
        -- 為所有菜單分配訪問權限（menu_id, power_id=NULL 表示可以訪問該菜單）
        FOR menu_rec IN SELECT id FROM menu WHERE is_enable = true LOOP
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (admin_role_id, menu_rec.id, NULL, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END LOOP;

        -- 為所有權限分配
        FOR power_rec IN SELECT id, menu_id FROM power WHERE is_enable = true LOOP
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (admin_role_id, power_rec.menu_id, power_rec.id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
END $$;

-- ============================================
-- 6. 顯示結果
-- ============================================
SELECT 'RBAC menu items and permissions have been created successfully!' AS status;

-- 查看所有菜單
SELECT id, title, url, parent, sort, is_enable FROM menu ORDER BY parent, sort;

-- 查看所有權限
SELECT p.id, p.menu_id, m.title AS menu_title, p.title, p.code, p.is_enable
FROM power p
JOIN menu m ON p.menu_id = m.id
ORDER BY m.sort, p.sort;
