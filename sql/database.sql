CREATE DATABASE ems;
CREATE ROLE ems_user WITH LOGIN PASSWORD 'ji394@ems_user';
GRANT ALL PRIVILEGES ON DATABASE ems TO ems_user;


-- 新增角色
CREATE ROLE ems_readwrite;
-- 指定角色能用的database
GRANT CONNECT ON DATABASE ems TO ems_readwrite;
--需要切換到db底下
-- 指定角色SCHEMA
GRANT USAGE, CREATE ON SCHEMA public TO ems_readwrite;
-- 授予 readwrite 角色可以使用所有的 Sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO ems_readwrite;

GRANT ems_readwrite TO ems_user;


-- Drop table
-- DROP TABLE public.member;

CREATE TABLE public.member (
    id bigserial NOT NULL,
    name varchar(128) NOT NULL,
    email varchar(128) NOT NULL,
    image varchar(256) NULL,
    phone varchar(16) NULL,
    is_enable bool NOT NULL,
    create_id int8 NOT NULL,
    create_time timestamp NOT NULL,
    modify_id int8 NOT NULL,
    modify_time timestamp NOT NULL,
    CONSTRAINT pk_member PRIMARY KEY (id)
);

-- Drop table
-- DROP TABLE public.menu;

CREATE TABLE public.menu (
    id bigserial NOT NULL,
    title varchar(32) NOT NULL,
    icon varchar(32) NULL,
    url varchar(128) NOT NULL,
    parent int8 NULL,
    description varchar(128) NULL,
    sort int8 NULL,
    is_enable bool NOT NULL,
    is_show bool NOT NULL,
    create_id int8 NOT NULL,
    create_time timestamp NOT NULL,
    modify_id int8 NOT NULL,
    modify_time timestamp NOT NULL,
    CONSTRAINT pk_menu PRIMARY KEY (id)
);

-- Drop table
-- DROP TABLE public.role;

CREATE TABLE public.role (
    id bigserial NOT NULL,
    title varchar(32) NOT NULL,
    description varchar(128) NULL,
    sort int8 NULL,
    is_enable bool NOT NULL,
    create_id int8 NOT NULL,
    create_time timestamp NOT NULL,
    modify_id int8 NOT NULL,
    modify_time timestamp NOT NULL,
    CONSTRAINT pk_role PRIMARY KEY (id)
);

-- Drop table
-- DROP TABLE public.forgot_temp;

CREATE TABLE public.forgot_temp (
    id bigserial NOT NULL,
    member_id int8 NOT NULL,
    expire_time timestamp NOT NULL,
    code varchar(128) NOT NULL,
    redirect_path varchar(512) NULL,
    CONSTRAINT pk_forgot_temp PRIMARY KEY (id),
    CONSTRAINT fk_forgot_temp_member_id FOREIGN KEY (member_id) REFERENCES public.member(id)
);

-- Drop table
-- DROP TABLE public.member_history;

CREATE TABLE public.member_history (
    id bigserial NOT NULL,
    member_id int8 NOT NULL,
    salt      text not null,
    hash      text not null,
    error_count int2 NOT NULL DEFAULT 0,
    create_id int8 NOT NULL,
    create_time timestamp NOT NULL,
    modify_id int8 NOT NULL,
    modify_time timestamp NOT NULL,
    CONSTRAINT pk_member_history PRIMARY KEY (id),
    CONSTRAINT fk_member_history_member_id FOREIGN KEY (member_id) REFERENCES public.member(id)
);

-- Drop table
-- DROP TABLE public.member_role;

CREATE TABLE public.member_role (
    id bigserial NOT NULL,
    role_id int8 NOT NULL,
    member_id int8 NOT NULL,
    CONSTRAINT pk_member_role PRIMARY KEY (id),
    CONSTRAINT fk_member_role_member_id FOREIGN KEY (member_id) REFERENCES public.member(id),
    CONSTRAINT fk_member_role_role_id FOREIGN KEY (role_id) REFERENCES public.role(id)
);

-- Drop table
-- DROP TABLE public.power;

CREATE TABLE public.power (
    id bigserial NOT NULL,
    menu_id int8 NOT NULL,
    title varchar(32) NOT NULL,
    code varchar(32) NOT NULL,
    description varchar(128) NULL,
    sort int8 NULL,
    is_enable bool NOT NULL,
    create_id int8 NOT NULL,
    create_time timestamp NOT NULL,
    modify_id int8 NOT NULL,
    modify_time timestamp NOT NULL,
    CONSTRAINT pk_power PRIMARY KEY (id),
    CONSTRAINT fk_power_menu_id FOREIGN KEY (menu_id) REFERENCES public.menu(id)
);

-- Drop table
-- DROP TABLE public.role_power;

CREATE TABLE public.role_power (
    id bigserial NOT NULL,
    role_id int8 NOT NULL,
    menu_id int8 NOT NULL,
    power_id int8 NULL,
    create_id int8 NOT NULL,
    create_time timestamp NOT NULL,
    modify_id int8 NOT NULL,
    modify_time timestamp NOT NULL,
    CONSTRAINT pk_role_power PRIMARY KEY (id),
    CONSTRAINT fk_role_power_menu_id FOREIGN KEY (menu_id) REFERENCES public.menu(id),
    CONSTRAINT fk_role_power_power_id FOREIGN KEY (power_id) REFERENCES public.power(id),
    CONSTRAINT fk_role_power_role_id FOREIGN KEY (role_id) REFERENCES public.role(id)
);

CREATE TABLE public.system_log (
    id serial4 NOT NULL,
    level varchar(128) NOT NULL,
    message json NOT NULL,
    timestamp timestamp NOT NULL,
    CONSTRAINT system_log_pkey PRIMARY KEY (id)
);

-- Views renaming
CREATE OR REPLACE VIEW public.v_member_role
AS SELECT member_role.id,
    member_role.member_id,
    member."name" as member_name,
    member_role.role_id,
    role.title AS role_title
   FROM member_role
     JOIN role ON role.id = member_role.role_id
	 JOIN member ON member.id = member_role.member_id;
	
CREATE OR REPLACE VIEW public.v_power
AS SELECT power.id,
    power.menu_id,
    menu.title AS menu_name,
    menu.sort AS menu_sort,
    power.title,
    power.code,
    power.description,
    power.sort,
    power.is_enable
   FROM power
     JOIN menu ON menu.id = power.menu_id
  ORDER BY menu.sort, power.sort;

CREATE OR REPLACE VIEW public.v_role_power
AS SELECT role_power.id,
    role_power.role_id,
    role.title AS role_title,
    role_power.menu_id,
    menu.title AS menu_title,
    role_power.power_id,
    power.title AS power_title,
    power.code AS power_code
   FROM role_power
     JOIN role ON role.id = role_power.role_id
     JOIN menu ON menu.id = role_power.menu_id
     LEFT JOIN power ON power.id = role_power.power_id;

    
INSERT INTO "member"
( "name",  "email", "is_enable", "create_id", "create_time", "modify_id", "modify_time")
VALUES( 'SystemAdmin','system@hair',true, 1, '2020-11-29 03:53:46.988', 1, '2020-11-29 07:41:35.292');

INSERT INTO member_history
("member_id", "password", "salt", "error_count",  "create_id", "create_time", "modify_id", "modify_time")
VALUES(1, '84c67b3049a3eb8fd84e556bf05ad66cf151ea22c0211eb95be975cccacdcc016dbcd35a95b8530c75165dcff2ec8fdb197009a8539f466005961948130918cd', '453112bf6ef24884b069b8b1ff889f99', 0, 1, '2020-06-04 11:53:46.988', 1, '2023-02-17 09:40:09.000');


INSERT INTO "role"
(title, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
VALUES('SystemAdmin', '', 0, true, 1, '2023-12-04', 1, '2023-12-04');

INSERT INTO member_role
(role_id, member_id)
VALUES(1, 1);

INSERT INTO menu
(title, icon, url, parent, description, sort, is_enable, is_show, create_id, create_time, modify_id, modify_time)
VALUES('setting', 'SettingsIcon', '/setting', 0, '系統設定', 2, true, true, 1, '2023-12-22 05:31:14.126', 1, '2023-12-22 05:31:14.126');
INSERT INTO menu
(title, icon, url, parent, description, sort, is_enable, is_show, create_id, create_time, modify_id, modify_time)
VALUES('menu', 'ListIcon', '/menu', 1, '選單管理', 1, true, true, 1, '2023-12-22 05:31:39.477', 1, '2023-12-22 05:31:39.477');
INSERT INTO menu
(title, icon, url, parent, description, sort, is_enable, is_show, create_id, create_time, modify_id, modify_time)
VALUES('power', 'PolicyIcon', '/power', 1, '權限管理', 2, true, true, 1, '2023-12-22 05:31:47.418', 1, '2023-12-22 05:31:47.418');
INSERT INTO menu
(title, icon, url, parent, description, sort, is_enable, is_show, create_id, create_time, modify_id, modify_time)
VALUES('role', 'PersonIcon', '/role', 1, '角色管理', 3, true, true, 1, '2023-12-25 06:16:13.451', 1, '2023-12-25 06:16:13.451');
INSERT INTO menu
(title, icon, url, parent, description, sort, is_enable, is_show, create_id, create_time, modify_id, modify_time)
VALUES('user', 'PeopleIcon', '/user', 1, '用戶管理', 4, true, true, 1, '2023-12-25 06:15:41.929', 1, '2023-12-25 06:15:41.929');

INSERT INTO menu
(title, icon, url, parent, description, sort, is_enable, is_show, create_id, create_time, modify_id, modify_time)
VALUES('partner', 'SettingsIcon', '/partner', 0, '商戶管理', 2, true, true, 1, '2023-12-22 05:31:14.126', 1, '2023-12-22 05:31:14.126');


INSERT INTO power
(menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
VALUES(5, 'query', 'user:query', '', NULL, true, 1, '2024-01-04 18:24:28.986', 1, '2024-01-04 18:24:28.986');
INSERT INTO power
(menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
VALUES(5, 'queryById', 'user:queryById', '', NULL, true, 1, '2024-01-04 18:25:05.395', 1, '2024-01-04 18:25:05.395');
INSERT INTO power
(menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
VALUES(5, 'create', 'user:create', '', NULL, true, 1, '2024-01-04 18:24:28.986', 1, '2024-01-04 18:24:28.986');
INSERT INTO power
(menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
VALUES(5, 'update', 'user:update', '', NULL, true, 1, '2024-01-04 18:25:05.395', 1, '2024-01-04 18:25:05.395');
INSERT INTO power
(menu_id, title, code, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
VALUES(5, 'delete', 'user:delete', '', NULL, true, 1, '2024-01-04 18:25:05.395', 1, '2024-01-04 18:25:05.395');

INSERT INTO role_power
(role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
VALUES(1, 1, NULL, 1, '2024-01-04 18:27:35.126', 1, '2024-01-04 18:27:35.126');
INSERT INTO role_power
(role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
VALUES(1, 2, NULL, 1, '2024-01-04 18:27:35.126', 1, '2024-01-04 18:27:35.126');
INSERT INTO role_power
(role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
VALUES(1, 3, NULL, 1, '2024-01-04 18:27:35.126', 1, '2024-01-04 18:27:35.126');
INSERT INTO role_power
(role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
VALUES(1, 4, NULL, 1, '2024-01-04 18:27:35.126', 1, '2024-01-04 18:27:35.126');
INSERT INTO role_power
(role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
VALUES(1, 5, NULL, 1, '2024-01-04 18:27:35.126', 1, '2024-01-04 18:27:35.126');
INSERT INTO role_power
(role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
VALUES(1, 5, 1, 1, '2024-01-04 18:27:35.126', 1, '2024-01-04 18:27:35.126');
INSERT INTO role_power
(role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
VALUES(1, 5, 2, 1, '2024-01-04 18:27:35.126', 1, '2024-01-04 18:27:35.126');
INSERT INTO role_power
(role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
VALUES(1, 5, 3, 1, '2024-01-04 18:27:35.126', 1, '2024-01-04 18:27:35.126');
INSERT INTO role_power
(role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
VALUES(1, 5, 4, 1, '2024-01-04 18:27:35.126', 1, '2024-01-04 18:27:35.126');
INSERT INTO role_power
(role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
VALUES(1, 5, 5, 1, '2024-01-04 18:27:35.126', 1, '2024-01-04 18:27:35.126');
-- partner
INSERT INTO role_power
(role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
VALUES(1, 6, NULL, 1, '2024-01-04 18:27:35.126', 1, '2024-01-04 18:27:35.126');
-- express 需要
create table public.access_token(
    id bigserial PRIMARY KEY NOT NULL,
    "member_id" bigint references public.member(id) not null,
    "access_token" varchar(256) not null,
    "refresh_token" varchar(256) unique not null,
    "create_id" bigint   NOT NULL,
    "create_time" timestamp   NOT NULL,
    "modify_id" bigint   NOT NULL,
    "modify_time" timestamp   NOT NULL
);





