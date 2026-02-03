-- ===================================================
-- 設備管理權限設置 SQL
-- 此腳本用於添加設備管理的菜單項和權限
-- 僅 system 角色可以訪問
-- ===================================================

-- 1. 添加設備管理菜單項
-- 先查詢設置菜單的 ID
-- SELECT id, title, url FROM menu WHERE url LIKE '%setting%' OR title LIKE '%設%';

INSERT INTO menu
(title, icon, url, parent, description, sort, is_enable, is_show, create_id, create_time, modify_id, modify_time)
VALUES (
    '設備管理',
    'QrCodeIcon',
    '/setting/device',
    (SELECT id FROM menu WHERE url = '/setting' LIMIT 1),  -- 父菜單 ID
    '管理設備 SN 碼',
    50,
    true,
    true,  -- is_show
    1,
    NOW(),
    1,
    NOW()
)
ON CONFLICT DO NOTHING;

-- 2. 添加設備管理的權限項目
DO $$
DECLARE
    device_menu_id bigint;
    system_role_id bigint;
BEGIN
    -- 獲取設備管理菜單 ID
    SELECT id INTO device_menu_id FROM menu WHERE url = '/setting/device' LIMIT 1;

    IF device_menu_id IS NULL THEN
        RAISE NOTICE 'Device menu not found. Please check if the menu was inserted correctly.';
        RETURN;
    END IF;

    RAISE NOTICE 'Device menu ID: %', device_menu_id;

    -- 插入權限項目 (使用 ON CONFLICT 避免重複)
    INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
    VALUES (device_menu_id, '查看設備', 'device:read', '查看設備列表和詳情', 1, true, 1, NOW(), 1, NOW())
    ON CONFLICT DO NOTHING;

    INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
    VALUES (device_menu_id, '新增設備', 'device:create', '新增設備 SN 碼', 2, true, 1, NOW(), 1, NOW())
    ON CONFLICT DO NOTHING;

    INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
    VALUES (device_menu_id, '編輯設備', 'device:update', '編輯設備 SN 碼', 3, true, 1, NOW(), 1, NOW())
    ON CONFLICT DO NOTHING;

    INSERT INTO power (menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
    VALUES (device_menu_id, '刪除設備', 'device:delete', '刪除設備', 4, true, 1, NOW(), 1, NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Device permissions created successfully.';

    -- 獲取 system 角色 ID
    SELECT id INTO system_role_id FROM role WHERE title = 'system' OR title = 'System' OR title = 'SYSTEM' LIMIT 1;

    -- 將設備管理權限分配給 system 角色
    IF system_role_id IS NOT NULL THEN
        INSERT INTO role_power (role_id, power_id, create_id, create_time, modify_id, modify_time)
        SELECT system_role_id, p.id, 1, NOW(), 1, NOW()
        FROM power p
        WHERE p.code LIKE 'device:%'
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Device permissions assigned to system role (ID: %)', system_role_id;
    ELSE
        RAISE NOTICE 'System role not found. Please assign permissions manually in the admin panel.';
    END IF;
END $$;

-- 3. 驗證設置
-- 查看新增的菜單
SELECT id, title, url, parent, is_enable, is_show FROM menu WHERE url = '/setting/device';

-- 查看新增的權限
SELECT id, menu_id, title, code, is_enable FROM power WHERE code LIKE 'device:%';

-- 查看所有角色
SELECT id, title FROM role;

-- 查看 system 角色的設備權限
SELECT r.title as role_name, p.code as permission_code, p.title as permission_name
FROM role r
JOIN role_power rp ON r.id = rp.role_id
JOIN power p ON rp.power_id = p.id
WHERE p.code LIKE 'device:%';
