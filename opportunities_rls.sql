-- 1. Enable Row Level Security on the opportunities table
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- 2. Public Read Policy
-- Allows anyone (authenticated or anonymous) to SELECT opportunities
CREATE POLICY "Public can view opportunities" 
ON public.opportunities 
FOR SELECT 
USING (true);

-- 3. Admin-Only Write Policies
-- Allows INSERT only if the user's role in the profiles table is 'admin'
CREATE POLICY "Admins can insert opportunities" 
ON public.opportunities 
FOR INSERT 
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::app_role
);

-- Allows UPDATE only if the user's role in the profiles table is 'admin'
CREATE POLICY "Admins can update opportunities" 
ON public.opportunities 
FOR UPDATE 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::app_role
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::app_role
);

-- Allows DELETE only if the user's role in the profiles table is 'admin'
CREATE POLICY "Admins can delete opportunities" 
ON public.opportunities 
FOR DELETE 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::app_role
);
