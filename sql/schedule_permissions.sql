-- ============================================
-- Schedule Management Menu and Permissions
-- ============================================
--
-- 權限說明:
-- schedule:read   - 查看排程列表
-- schedule:create - 創建新排程
-- schedule:update - 更新排程設定
-- schedule:delete - 刪除排程
-- schedule:sync   - 同步排程至設備 (用於 POST /companies/:id/devices/:deviceId/sync)
--
-- 注意: 設備資訊查詢 (POST /companies/:id/devices/:deviceId/info) 使用 company:view_devices 權限
--

-- 1. Add Schedule Management menu under Settings
DO $$
DECLARE
    settings_menu_id INT;
    schedule_menu_id INT;
BEGIN
    -- Find Settings menu
    SELECT id INTO settings_menu_id FROM menu WHERE title = '設定' OR title = '設置' OR url = '/setting' LIMIT 1;

    -- If no Settings menu found, use 1 as default parent
    IF settings_menu_id IS NULL THEN
        settings_menu_id := 1;
    END IF;

    -- Insert Schedule Management menu
    INSERT INTO menu (title, icon, url, parent, sort, is_enable, is_show, create_id, create_time, modify_id, modify_time)
    VALUES ('排程管理', 'ScheduleIcon', '/schedule', settings_menu_id, 8, true, true, 1, NOW(), 1, NOW())
    ON CONFLICT DO NOTHING
    RETURNING id INTO schedule_menu_id;

    -- If insert failed (already exists), get the existing ID
    IF schedule_menu_id IS NULL THEN
        SELECT id INTO schedule_menu_id FROM menu WHERE title = '排程管理' LIMIT 1;
    END IF;

    RAISE NOTICE 'Schedule menu ID: %', schedule_menu_id;
END $$;

-- 2. Create permissions for Schedule Management
DO $$
DECLARE
    schedule_menu_id INT;
BEGIN
    SELECT id INTO schedule_menu_id FROM menu WHERE title = '排程管理' LIMIT 1;

    IF schedule_menu_id IS NOT NULL THEN
        -- schedule:read - 查看排程
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (schedule_menu_id, '查看排程', 'schedule:read', '查看排程列表', 1, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- schedule:create - 創建排程
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (schedule_menu_id, '創建排程', 'schedule:create', '創建新排程', 2, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- schedule:update - 更新排程
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (schedule_menu_id, '更新排程', 'schedule:update', '更新排程設定', 3, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- schedule:delete - 刪除排程
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (schedule_menu_id, '刪除排程', 'schedule:delete', '刪除排程', 4, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- schedule:sync - 同步排程
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (schedule_menu_id, '同步排程', 'schedule:sync', '同步排程至設備', 5, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Schedule permissions created';
    ELSE
        RAISE NOTICE 'Schedule menu not found, skipping permission creation';
    END IF;
END $$;

-- 3. Add history:read permission
DO $$
DECLARE
    analyze_menu_id INT;
BEGIN
    -- Find Analyze menu or create under root
    SELECT id INTO analyze_menu_id FROM menu WHERE title = '數據分析' OR url = '/analyze' LIMIT 1;

    IF analyze_menu_id IS NOT NULL THEN
        -- history:read - 查看歷史數據
        INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
        VALUES (analyze_menu_id, '查看歷史', 'history:read', '查看歷史數據', 10, true, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'History permission created';
    END IF;
END $$;

-- 4. Assign permissions to SystemAdmin (role_id=1)
DO $$
DECLARE
    admin_role_id INT := 1;
    schedule_menu_id INT;
    power_rec RECORD;
BEGIN
    SELECT id INTO schedule_menu_id FROM menu WHERE title = '排程管理' LIMIT 1;

    IF schedule_menu_id IS NOT NULL THEN
        -- Menu access permission
        INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
        VALUES (admin_role_id, schedule_menu_id, NULL, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- All power permissions
        FOR power_rec IN SELECT id FROM power WHERE menu_id = schedule_menu_id LOOP
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (admin_role_id, schedule_menu_id, power_rec.id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END LOOP;

        RAISE NOTICE 'SystemAdmin schedule permissions assigned';
    END IF;
END $$;

-- 5. Assign permissions to company_manager
DO $$
DECLARE
    manager_role_id INT;
    schedule_menu_id INT;
    power_id INT;
BEGIN
    SELECT id INTO manager_role_id FROM role WHERE title = 'company_manager' LIMIT 1;
    SELECT id INTO schedule_menu_id FROM menu WHERE title = '排程管理' LIMIT 1;

    IF manager_role_id IS NOT NULL AND schedule_menu_id IS NOT NULL THEN
        -- Menu access
        INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
        VALUES (manager_role_id, schedule_menu_id, NULL, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- schedule:read
        SELECT id INTO power_id FROM power WHERE code = 'schedule:read' LIMIT 1;
        IF power_id IS NOT NULL THEN
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (manager_role_id, schedule_menu_id, power_id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END IF;

        -- schedule:create
        SELECT id INTO power_id FROM power WHERE code = 'schedule:create' LIMIT 1;
        IF power_id IS NOT NULL THEN
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (manager_role_id, schedule_menu_id, power_id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END IF;

        -- schedule:update
        SELECT id INTO power_id FROM power WHERE code = 'schedule:update' LIMIT 1;
        IF power_id IS NOT NULL THEN
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (manager_role_id, schedule_menu_id, power_id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END IF;

        -- schedule:delete
        SELECT id INTO power_id FROM power WHERE code = 'schedule:delete' LIMIT 1;
        IF power_id IS NOT NULL THEN
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (manager_role_id, schedule_menu_id, power_id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END IF;

        -- schedule:sync
        SELECT id INTO power_id FROM power WHERE code = 'schedule:sync' LIMIT 1;
        IF power_id IS NOT NULL THEN
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (manager_role_id, schedule_menu_id, power_id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END IF;

        RAISE NOTICE 'company_manager schedule permissions assigned';
    END IF;
END $$;

-- 6. Assign read-only permissions to company_user
DO $$
DECLARE
    user_role_id INT;
    schedule_menu_id INT;
    power_id INT;
BEGIN
    SELECT id INTO user_role_id FROM role WHERE title = 'company_user' LIMIT 1;
    SELECT id INTO schedule_menu_id FROM menu WHERE title = '排程管理' LIMIT 1;

    IF user_role_id IS NOT NULL AND schedule_menu_id IS NOT NULL THEN
        -- Menu access
        INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
        VALUES (user_role_id, schedule_menu_id, NULL, 1, NOW(), 1, NOW())
        ON CONFLICT DO NOTHING;

        -- schedule:read only
        SELECT id INTO power_id FROM power WHERE code = 'schedule:read' LIMIT 1;
        IF power_id IS NOT NULL THEN
            INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
            VALUES (user_role_id, schedule_menu_id, power_id, 1, NOW(), 1, NOW())
            ON CONFLICT DO NOTHING;
        END IF;

        RAISE NOTICE 'company_user schedule permissions assigned';
    END IF;
END $$;

-- 7. Verification
SELECT '=== Schedule Management Menu ===' as section;
SELECT id, title, url, parent, is_enable FROM menu WHERE title = '排程管理';

SELECT '=== Schedule Permissions ===' as section;
SELECT id, menu_id, code, title FROM power WHERE code LIKE 'schedule:%' OR code = 'history:read' ORDER BY code;

SELECT '=== Role Permissions Summary ===' as section;
SELECT
    r.title as role_name,
    COUNT(rp.id) FILTER (WHERE p.code LIKE 'schedule:%') as schedule_permissions
FROM role r
LEFT JOIN role_power rp ON r.id = rp.role_id
LEFT JOIN power p ON rp.power_id = p.id
WHERE r.title IN ('SystemAdmin', 'company_manager', 'company_user')
GROUP BY r.id, r.title
ORDER BY r.id;
