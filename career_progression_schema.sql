-- Create the kanban_status enum
CREATE TYPE kanban_status AS ENUM ('IN_PROGRESS', 'OUTCOME_COMPLETE', 'OUTCOME_FAILED');

-- Create the career_tasks table
CREATE TABLE career_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    -- linked_id is optional and references an external table if one exists (e.g., jobs, hackathons, or opportunities)
    linked_id UUID,
    status kanban_status NOT NULL DEFAULT 'IN_PROGRESS',
    completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the task_checklists table
CREATE TABLE task_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES career_tasks(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    is_checked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup Row Level Security (RLS) for career_tasks
ALTER TABLE career_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own career tasks"
    ON career_tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own career tasks"
    ON career_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career tasks"
    ON career_tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own career tasks"
    ON career_tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Setup Row Level Security (RLS) for task_checklists
ALTER TABLE task_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklists for their tasks"
    ON task_checklists FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM career_tasks 
        WHERE career_tasks.id = task_checklists.task_id 
        AND career_tasks.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert checklists for their tasks"
    ON task_checklists FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM career_tasks 
        WHERE career_tasks.id = task_checklists.task_id 
        AND career_tasks.user_id = auth.uid()
    ));

CREATE POLICY "Users can update checklists for their tasks"
    ON task_checklists FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM career_tasks 
        WHERE career_tasks.id = task_checklists.task_id 
        AND career_tasks.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete checklists for their tasks"
    ON task_checklists FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM career_tasks 
        WHERE career_tasks.id = task_checklists.task_id 
        AND career_tasks.user_id = auth.uid()
    ));

-- Create triggers to automatically update the updated_at columns
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_career_tasks_modtime
    BEFORE UPDATE ON career_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_task_checklists_modtime
    BEFORE UPDATE ON task_checklists
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
