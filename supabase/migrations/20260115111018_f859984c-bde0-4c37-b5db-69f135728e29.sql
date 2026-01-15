-- Add notification settings to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS price_alerts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS new_complexes_alerts boolean DEFAULT false;

-- Create view history table
CREATE TABLE public.view_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  complex_id uuid NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.view_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for view history
CREATE POLICY "Users can view their own history"
ON public.view_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their history"
ON public.view_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their history"
ON public.view_history FOR DELETE
USING (auth.uid() = user_id);

-- Create saved searches table
CREATE TABLE public.saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  city_id uuid,
  min_price bigint,
  max_price bigint,
  rooms integer[],
  districts text[],
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved searches
CREATE POLICY "Users can view their saved searches"
ON public.saved_searches FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create saved searches"
ON public.saved_searches FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their saved searches"
ON public.saved_searches FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved searches"
ON public.saved_searches FOR DELETE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_view_history_user_id ON public.view_history(user_id);
CREATE INDEX idx_view_history_viewed_at ON public.view_history(viewed_at DESC);
CREATE INDEX idx_saved_searches_user_id ON public.saved_searches(user_id);