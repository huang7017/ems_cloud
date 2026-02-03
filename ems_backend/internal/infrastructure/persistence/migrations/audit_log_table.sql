-- Audit Log Table for tracking sensitive operations
-- This table records all significant actions performed by users for security and compliance

CREATE TABLE public.audit_log (
    id bigserial PRIMARY KEY NOT NULL,
    member_id int8 NOT NULL,
    role_id int8 NOT NULL,
    action varchar(64) NOT NULL,           -- e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    resource_type varchar(64) NOT NULL,    -- e.g., 'MENU', 'ROLE', 'POWER', 'USER'
    resource_id int8 NULL,                 -- ID of the affected resource
    details jsonb NULL,                    -- Additional contextual information
    ip_address varchar(45) NULL,           -- IPv4 or IPv6 address
    user_agent varchar(512) NULL,          -- Browser/client information
    status varchar(32) NOT NULL,           -- 'SUCCESS' or 'FAILURE'
    error_message text NULL,               -- Error details if status is FAILURE
    create_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_log_member_id FOREIGN KEY (member_id) REFERENCES public.member(id),
    CONSTRAINT fk_audit_log_role_id FOREIGN KEY (role_id) REFERENCES public.role(id)
);

-- Indexes for efficient querying
CREATE INDEX idx_audit_log_member_id ON public.audit_log(member_id);
CREATE INDEX idx_audit_log_role_id ON public.audit_log(role_id);
CREATE INDEX idx_audit_log_create_time ON public.audit_log(create_time DESC);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);
CREATE INDEX idx_audit_log_resource_type ON public.audit_log(resource_type);
CREATE INDEX idx_audit_log_resource_id ON public.audit_log(resource_type, resource_id);

-- View for easy audit log querying with member and role names
CREATE OR REPLACE VIEW public.v_audit_log AS
SELECT
    al.id,
    al.member_id,
    m.name AS member_name,
    m.email AS member_email,
    al.role_id,
    r.title AS role_name,
    al.action,
    al.resource_type,
    al.resource_id,
    al.details,
    al.ip_address,
    al.user_agent,
    al.status,
    al.error_message,
    al.create_time
FROM audit_log al
JOIN member m ON m.id = al.member_id
JOIN role r ON r.id = al.role_id
ORDER BY al.create_time DESC;

-- Grant permissions to ems_readwrite role
GRANT SELECT, INSERT ON public.audit_log TO ems_readwrite;
GRANT SELECT ON public.v_audit_log TO ems_readwrite;
GRANT USAGE ON SEQUENCE public.audit_log_id_seq TO ems_readwrite;
