-- ===================================================
-- 修復 SystemAdmin 權限
-- 給 role_id=1 (SystemAdmin) 所有權限
-- ===================================================

-- 1. 查看當前狀況
SELECT '=== 所有角色 ===' as info;
SELECT id, title FROM role;

SELECT '=== 所有權限 ===' as info;
SELECT p.id, p.menu_id, p.code, p.title FROM power p ORDER BY p.menu_id, p.id;

SELECT '=== member_id=1 的角色 ===' as info;
SELECT m.id, m.name, mr.role_id, r.title as role_title
FROM member m
LEFT JOIN member_role mr ON m.id = mr.member_id
LEFT JOIN role r ON mr.role_id = r.id
WHERE m.id = 1;

-- 2. 將所有權限分配給 role_id=1
-- role_power 表需要: role_id, menu_id, power_id
INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
SELECT
    1,           -- role_id = 1 (SystemAdmin)
    p.menu_id,   -- menu_id 從 power 取得
    p.id,        -- power_id
    1,
    NOW(),
    1,
    NOW()
FROM power p
WHERE NOT EXISTS (
    SELECT 1 FROM role_power rp
    WHERE rp.role_id = 1 AND rp.power_id = p.id
);

-- 3. 驗證結果
SELECT '=== role_id=1 現在擁有的權限 ===' as info;
SELECT rp.role_id, r.title as role_name, p.code, p.title as permission_name
FROM role_power rp
JOIN role r ON rp.role_id = r.id
JOIN power p ON rp.power_id = p.id
WHERE rp.role_id = 1
ORDER BY p.code;

SELECT '=== 權限總數 ===' as info;
SELECT COUNT(*) as total_permissions FROM role_power WHERE role_id = 1 AND power_id IS NOT NULL;
