-- EcoTask Database Schema
-- PostgreSQL Database Structure for EcoTask Application

-- Create database
-- CREATE DATABASE ecotask;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#10b981', -- Hex color code
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_co2 DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project members (many-to-many relationship)
CREATE TABLE project_members (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('LIGHT', 'TECHNICAL', 'INTENSIVE')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE')),
    assignee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    estimated_hours DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    actual_hours DECIMAL(5,2) DEFAULT 0.00,
    co2_emissions DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Task types configuration (for CO2 calculations)
CREATE TABLE task_types (
    type VARCHAR(20) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    co2_per_hour DECIMAL(5,2) NOT NULL,
    examples TEXT[]
);

-- Insert default task types
INSERT INTO task_types (type, label, description, co2_per_hour, examples) VALUES
('LIGHT', 'Bureautique légère', 'Tâches de bureau standard', 0.10, ARRAY['Rédaction de documents', 'Réunions en ligne', 'Emails']),
('TECHNICAL', 'Technique', 'Développement et conception', 1.00, ARRAY['Développement', 'Conception graphique', 'Tests']),
('INTENSIVE', 'Forte intensité', 'Calculs lourds et rendu', 3.50, ARRAY['Simulation', 'Rendu vidéo', 'Calculs lourds']);

-- Indexes for better performance
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_users_email ON users(email);

-- Function to update project total CO2
CREATE OR REPLACE FUNCTION update_project_co2()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE projects 
    SET total_co2 = (
        SELECT COALESCE(SUM(co2_emissions), 0)
        FROM tasks 
        WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update project CO2 when tasks change
CREATE TRIGGER trigger_update_project_co2
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_co2();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries

-- View for task details with user and project info
CREATE VIEW task_details AS
SELECT 
    t.*,
    u.name as assignee_name,
    u.email as assignee_email,
    p.name as project_name,
    p.color as project_color,
    tt.label as type_label,
    tt.co2_per_hour
FROM tasks t
JOIN users u ON t.assignee_id = u.id
JOIN projects p ON t.project_id = p.id
JOIN task_types tt ON t.type = tt.type;

-- View for project statistics
CREATE VIEW project_stats AS
SELECT 
    p.*,
    u.name as owner_name,
    COUNT(t.id) as task_count,
    COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) as completed_tasks,
    SUM(t.estimated_hours) as total_estimated_hours,
    SUM(t.actual_hours) as total_actual_hours,
    COUNT(pm.user_id) as member_count
FROM projects p
JOIN users u ON p.owner_id = u.id
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN project_members pm ON p.id = pm.project_id
GROUP BY p.id, u.name;

-- Sample data for testing
INSERT INTO users (id, name, email, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Alice Martin', 'alice@example.com', 'admin'),
('550e8400-e29b-41d4-a716-446655440002', 'Bob Dupont', 'bob@example.com', 'member'),
('550e8400-e29b-41d4-a716-446655440003', 'Claire Rousseau', 'claire@example.com', 'member');

INSERT INTO projects (id, name, description, color, owner_id) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Site Web Éco-responsable', 'Développement d''un site web optimisé pour réduire l''empreinte carbone', '#10b981', '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440002', 'Application Mobile Verte', 'App mobile pour sensibiliser aux pratiques écologiques', '#059669', '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO project_members (project_id, user_id) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003');

INSERT INTO tasks (title, description, type, priority, status, assignee_id, project_id, estimated_hours, co2_emissions, due_date) VALUES
('Optimiser les requêtes de base de données', 'Améliorer les performances des requêtes SQL pour réduire la consommation énergétique', 'TECHNICAL', 'HIGH', 'IN_PROGRESS', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 8.0, 8.0, '2024-02-15 17:00:00+00'),
('Rédiger la documentation utilisateur', 'Créer la documentation complète pour les nouvelles fonctionnalités', 'LIGHT', 'MEDIUM', 'TODO', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 4.0, 0.4, '2024-02-20 17:00:00+00');
