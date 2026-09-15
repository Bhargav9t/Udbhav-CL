-- 1. Create a custom ENUM type for the ladder status
CREATE TYPE public.ladder_status AS ENUM ('saved', 'applied', 'interviewing', 'completed');

-- 2. Create the user_ladder table
CREATE TABLE public.user_ladder (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  status public.ladder_status DEFAULT 'saved'::public.ladder_status,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent users from saving the exact same opportunity twice
  UNIQUE(user_id, opportunity_id)
);

-- 3. Enable Row Level Security
ALTER TABLE public.user_ladder ENABLE ROW LEVEL SECURITY;

-- 4. Create an ALL policy so users can fully manage their own rows
CREATE POLICY "Users can fully manage their own ladder" 
ON public.user_ladder 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
