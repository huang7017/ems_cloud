-- ============================================
-- Company Management Menu and Permissions
-- ============================================
--
-- 權限說明:
-- company:read           - 查看公司列表
-- company:create         - 創建新公司 (SystemAdmin only)
-- company:update         - 更新公司信息
-- company:delete         - 刪除公司 (SystemAdmin only)
-- company:create_manager - 為公司創建管理員 (SystemAdmin only)
-- company:manage_members - 管理公司成員
-- company:view_devices   - 查看公司設備 (也用於 POST /companies/:id/devices/:deviceId/info)
-- company:assign_devices - 分配設備給公司 (SystemAdmin only)
--
-- 注意: 設備排程同步 (POST /companies/:id/devices/:deviceId/sync) 使用 schedule:sync 權限
--

-- 1. Add Company Management menu under Settings
-- First, find the Settings parent menu ID
DO $$
DECLARE
    settings_menu_id INT;
    company_menu_id INT;
BEGIN
    -- Find Settings menu (parent = NULL or the root settings menu)
    SELECT id INTO settings_menu_id FROM menu WHERE title = '設定' OR title = '設置' OR url = '/setting' LIMIT 1;

    -- If no Settings menu found, use 1 as default parent
    IF settings_menu_id IS NULL THEN
        settings_menu_id := 1;
    END IF;

    -- Insert Company Management menu
    INSERT INTO menu (title, icon, url, parent, sort, is_enable, is_show, create_id, create_time, modify_id, modify_time)
    VALUES ('公司管理', 'BusinessIcon', '/company', settings_menu_id, 7, true, true, 1, NOW(), 1, NOW())
    ON CONFLICT DO NOTHING
    RETURNING id INTO company_menu_id;

    -- If insert failed (already exists), get the existing ID
    IF company_menu_id IS NULL THEN
        SELECT id INTO company_menu_id FROM menu WHERE title = '公司管理' LIMIT 1;
    END IF;

    RAISE NOTICE 'Company menu ID: %', company_menu_id;
END $$;

-- 2. Create permissions for Company Management
DO $$
DECLARE
    company_menu_id INT;
BEGIN
    SELECT id INTO company_menu_id FROM menu WHERE title = '公司管理' LIMIT 1;

    IF company_menu_id IS NOT NULL THEN
        -- company:read - 查看公司列表
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (company_menu_id, '查看公司', 'company:read', '查看公司列表', 1, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- company:create - 創建公司 (SystemAdmin only)
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (company_menu_id, '創建公司', 'company:create', '創建新公司', 2, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- company:update - 更新公司
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (company_menu_id, '更新公司', 'company:update', '更新公司信息', 3, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- company:delete - 刪除公司 (SystemAdmin only)
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (company_menu_id, '刪除公司', 'company:delete', '刪除公司', 4, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- company:create_manager - 創建公司管理員 (SystemAdmin only)
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (company_menu_id, '創建管理員', 'company:create_manager', '為公司創建管理員', 5, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- company:manage_members - 管理公司成員
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (company_menu_id, '管理成員', 'company:manage_members', '管理公司成員', 6, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- company:view_devices - 查看公司設備
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (company_menu_id, '查看設備', 'company:view_devices', '查看公司設備', 7, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- company:assign_devices - 分配設備 (SystemAdmin only)
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (company_menu_id, '分配設備', 'company:assign_devices', '分配設備給公司', 8, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Company permissions created';
    ELSE
        RAISE NOTICE 'Company menu not found, skipping permission creation';
    END IF;
END $$;

-- 3. Assign ALL company permissions to SystemAdmin (role_id=1)
DO $$
DECLARE
    admin_role_id INT := 1;
    company_menu_id INT;
    power_rec RECORD;
BEGIN
    SELECT id INTO company_menu_id FROM menu WHERE title = '公司管理' LIMIT 1;

    IF company_menu_id IS NOT NULL THEN
        -- Menu access permission (power_id = NULL)
        INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
        VALUES (admin_role_id, company_menu_id, NULL, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- All power permissions
        FOR power_rec IN SELECT id FROM power WHERE menu_id = company_menu_id LOOP
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (admin_role_id, company_menu_id, power_rec.id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END LOOP;

        RAISE NOTICE 'SystemAdmin permissions assigned';
    END IF;
END $$;

-- 4. Create company_manager role if not exists and assign permissions
DO $$
DECLARE
    manager_role_id INT;
    company_menu_id INT;
    power_id INT;
BEGIN
    -- Get or create company_manager role
    SELECT id INTO manager_role_id FROM role WHERE title = 'company_manager' LIMIT 1;

    IF manager_role_id IS NULL THEN
        INSERT INTO role (title, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES ('company_manager', '公司管理員', 1, true, 1, NOW(), 1, NOW())
        RETURNING id INTO manager_role_id;
        RAISE NOTICE 'Created company_manager role with ID: %', manager_role_id;
    ELSE
        RAISE NOTICE 'company_manager role already exists with ID: %', manager_role_id;
    END IF;

    SELECT id INTO company_menu_id FROM menu WHERE title = '公司管理' LIMIT 1;

    IF manager_role_id IS NOT NULL AND company_menu_id IS NOT NULL THEN
        -- Menu access
        INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
        VALUES (manager_role_id, company_menu_id, NULL, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- company:read
        SELECT id INTO power_id FROM power WHERE code = 'company:read' LIMIT 1;
        IF power_id IS NOT NULL THEN
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (manager_role_id, company_menu_id, power_id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END IF;

        -- company:update
        SELECT id INTO power_id FROM power WHERE code = 'company:update' LIMIT 1;
        IF power_id IS NOT NULL THEN
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (manager_role_id, company_menu_id, power_id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END IF;

        -- company:manage_members
        SELECT id INTO power_id FROM power WHERE code = 'company:manage_members' LIMIT 1;
        IF power_id IS NOT NULL THEN
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (manager_role_id, company_menu_id, power_id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END IF;

        -- company:view_devices
        SELECT id INTO power_id FROM power WHERE code = 'company:view_devices' LIMIT 1;
        IF power_id IS NOT NULL THEN
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (manager_role_id, company_menu_id, power_id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END IF;

        -- schedule:sync - 同步排程至設備 (用於 POST /companies/:id/devices/:deviceId/sync)
        SELECT id INTO power_id FROM power WHERE code = 'schedule:sync' LIMIT 1;
        IF power_id IS NOT NULL THEN
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (manager_role_id, company_menu_id, power_id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END IF;

        RAISE NOTICE 'company_manager permissions assigned';
    END IF;
END $$;

-- 5. Create company_user role if not exists and assign read-only permissions
DO $$
DECLARE
    user_role_id INT;
    company_menu_id INT;
    power_id INT;
BEGIN
    -- Get or create company_user role
    SELECT id INTO user_role_id FROM role WHERE title = 'company_user' LIMIT 1;

    IF user_role_id IS NULL THEN
        INSERT INTO role (title, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES ('company_user', '公司用戶', 2, true, 1, NOW(), 1, NOW())
        RETURNING id INTO user_role_id;
        RAISE NOTICE 'Created company_user role with ID: %', user_role_id;
    ELSE
        RAISE NOTICE 'company_user role already exists with ID: %', user_role_id;
    END IF;

    SELECT id INTO company_menu_id FROM menu WHERE title = '公司管理' LIMIT 1;

    IF user_role_id IS NOT NULL AND company_menu_id IS NOT NULL THEN
        -- Menu access
        INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
        VALUES (user_role_id, company_menu_id, NULL, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- company:read
        SELECT id INTO power_id FROM power WHERE code = 'company:read' LIMIT 1;
        IF power_id IS NOT NULL THEN
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (user_role_id, company_menu_id, power_id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END IF;

        -- company:view_devices (read-only)
        SELECT id INTO power_id FROM power WHERE code = 'company:view_devices' LIMIT 1;
        IF power_id IS NOT NULL THEN
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (user_role_id, company_menu_id, power_id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END IF;

        RAISE NOTICE 'company_user permissions assigned';
    END IF;
END $$;

-- 6. Verification queries
SELECT '=== Company Management Menu ===' as section;
SELECT id, title, url, parent, is_enable, is_show FROM menu WHERE title = '公司管理';

SELECT '=== Company Management Permissions ===' as section;
SELECT id, menu_id, code, title FROM power WHERE code LIKE 'company:%' ORDER BY sort;

SELECT '=== Role Permissions Summary ===' as section;
SELECT
    r.title as role_name,
    COUNT(rp.id) FILTER (WHERE rp.power_id IS NOT NULL) as permission_count,
    COUNT(rp.id) FILTER (WHERE rp.power_id IS NULL) as menu_access_count
FROM role r
LEFT JOIN role_power rp ON r.id = rp.role_id
LEFT JOIN menu m ON rp.menu_id = m.id AND m.title = '公司管理'
WHERE r.title IN ('SystemAdmin', 'company_manager', 'company_user')
GROUP BY r.id, r.title
ORDER BY r.id;

SELECT '=== Detailed Role-Permission Mapping ===' as section;
SELECT
    r.title as role_name,
    m.title as menu_name,
    COALESCE(p.code, '(菜單訪問)') as permission_code
FROM role_power rp
JOIN role r ON rp.role_id = r.id
JOIN menu m ON rp.menu_id = m.id
LEFT JOIN power p ON rp.power_id = p.id
WHERE m.title = '公司管理'
ORDER BY r.id, p.sort NULLS FIRST;
