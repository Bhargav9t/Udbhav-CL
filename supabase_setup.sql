-- 1. Create a custom ENUM type for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create the profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role app_role DEFAULT 'user'::app_role
);

-- 3. Set up Row Level Security (RLS)
-- Enable RLS on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to view ONLY their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 4. Set up the Trigger for Automatic Profile Creation
-- Create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name', -- Extracts full_name if provided during signup
    'user'::app_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that fires when a new row is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Create the kanban_status enum
CREATE TYPE kanban_status AS ENUM ('IN_PROGRESS', 'OUTCOME_COMPLETE', 'OUTCOME_FAILED');

-- 6. Create the career_tasks table
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

-- 7. Create the task_checklists table
CREATE TABLE task_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES career_tasks(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    is_checked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Setup Row Level Security (RLS) for career_tasks
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

-- 9. Setup Row Level Security (RLS) for task_checklists
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

-- 10. Create triggers to automatically update the updated_at columns
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
