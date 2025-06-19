/*
  # Messaging and Communication Functions

  1. New Functions
     - `send_message` - Creates a new chat message between users
     - `create_conversation` - Creates a new conversation between users
     - `get_user_conversations` - Retrieves conversations for a user
     - `mark_messages_as_read` - Updates read status of messages
  
  2. Triggers
     - `on_message_created` - Updates conversation with last message data
     - `on_conversation_created` - Sets up initial unread counts
  
  3. Security
     - RLS policies for secure messaging
*/

-- Function to create or get conversation
CREATE OR REPLACE FUNCTION public.create_conversation(
  p_participant_ids UUID[],
  p_job_id UUID DEFAULT NULL,
  p_job_title TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_exists BOOLEAN;
BEGIN
  -- Check if a conversation between these participants already exists
  SELECT 
    id, 
    TRUE
  INTO 
    v_conversation_id, 
    v_exists
  FROM public.chat_conversations
  WHERE 
    participant_ids @> p_participant_ids AND 
    array_length(participant_ids, 1) = array_length(p_participant_ids, 1) AND
    (p_job_id IS NULL OR job_id = p_job_id)
  LIMIT 1;
  
  -- If no existing conversation, create new one
  IF v_conversation_id IS NULL THEN
    INSERT INTO public.chat_conversations (
      participant_ids,
      job_id,
      job_title,
      unread_counts
    ) VALUES (
      p_participant_ids,
      p_job_id,
      p_job_title,
      jsonb_build_object(
        p_participant_ids[1]::TEXT, 0,
        p_participant_ids[2]::TEXT, 0
      )
    ) RETURNING id INTO v_conversation_id;
    
    v_exists := FALSE;
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send a message
CREATE OR REPLACE FUNCTION public.send_message(
  p_conversation_id UUID,
  p_receiver_id UUID,
  p_content TEXT
)
RETURNS UUID AS $$
DECLARE
  v_message_id UUID;
  v_sender_id UUID := auth.uid();
  v_unread_counts JSONB;
  v_receiver_count INTEGER;
BEGIN
  -- Get current unread counts
  SELECT unread_counts INTO v_unread_counts
  FROM public.chat_conversations
  WHERE id = p_conversation_id;
  
  -- Get current receiver count or default to 0
  v_receiver_count := COALESCE((v_unread_counts->>p_receiver_id::TEXT)::INTEGER, 0);
  
  -- Create message
  INSERT INTO public.chat_messages (
    conversation_id,
    sender_id,
    receiver_id,
    content
  ) VALUES (
    p_conversation_id,
    v_sender_id,
    p_receiver_id,
    p_content
  ) RETURNING id INTO v_message_id;
  
  -- Update unread counts
  UPDATE public.chat_conversations
  SET 
    unread_counts = jsonb_set(
      unread_counts, 
      ARRAY[p_receiver_id::TEXT], 
      (v_receiver_count + 1)::TEXT::jsonb
    )
  WHERE id = p_conversation_id;
  
  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's conversations
CREATE OR REPLACE FUNCTION public.get_user_conversations(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  participant_ids UUID[],
  job_id UUID,
  job_title TEXT,
  last_message TEXT,
  last_message_timestamp TIMESTAMPTZ,
  unread_count INTEGER,
  other_participant_name TEXT,
  other_participant_id UUID
) AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.participant_ids,
    cc.job_id,
    cc.job_title,
    cc.last_message,
    cc.last_message_timestamp,
    COALESCE((cc.unread_counts->>v_user_id::TEXT)::INTEGER, 0) AS unread_count,
    -- Get other participant details
    CASE
      WHEN ap.id IS NOT NULL THEN ap.name
      WHEN rp.id IS NOT NULL THEN rp.name
      ELSE 'Unknown User'
    END AS other_participant_name,
    (
      SELECT p FROM unnest(cc.participant_ids) p
      WHERE p != v_user_id
      LIMIT 1
    ) AS other_participant_id
  FROM
    public.chat_conversations cc
  LEFT JOIN
    public.applicant_profiles ap ON ap.id = (
      SELECT u.profile_id FROM public.users u
      WHERE u.id = (
        SELECT p FROM unnest(cc.participant_ids) p
        WHERE p != v_user_id
        LIMIT 1
      ) AND u.role = 'applicant'
    )
  LEFT JOIN
    public.recruiter_profiles rp ON rp.id = (
      SELECT u.profile_id FROM public.users u
      WHERE u.id = (
        SELECT p FROM unnest(cc.participant_ids) p
        WHERE p != v_user_id
        LIMIT 1
      ) AND u.role = 'recruiter'
    )
  WHERE
    cc.participant_ids @> ARRAY[v_user_id]
  ORDER BY
    cc.last_message_timestamp DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  p_conversation_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_unread_counts JSONB;
BEGIN
  -- Get current unread counts
  SELECT unread_counts INTO v_unread_counts
  FROM public.chat_conversations
  WHERE id = p_conversation_id;
  
  -- Update unread count for this user to 0
  UPDATE public.chat_conversations
  SET 
    unread_counts = jsonb_set(
      unread_counts, 
      ARRAY[v_user_id::TEXT], 
      '0'::jsonb
    )
  WHERE id = p_conversation_id;
  
  -- Mark all messages as read
  UPDATE public.chat_messages
  SET is_read = TRUE
  WHERE 
    conversation_id = p_conversation_id AND
    receiver_id = v_user_id AND
    is_read = FALSE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to update conversation on new message
CREATE OR REPLACE FUNCTION public.on_message_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation with last message info
  UPDATE public.chat_conversations
  SET 
    last_message = NEW.content,
    last_message_timestamp = NEW.timestamp
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create message trigger
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.on_message_created();

-- Enable RLS on messaging tables
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can see their own conversations"
  ON public.chat_conversations
  FOR SELECT
  TO authenticated
  USING (participant_ids @> ARRAY[auth.uid()]);

CREATE POLICY "Users can create conversations they are part of"
  ON public.chat_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (participant_ids @> ARRAY[auth.uid()]);

CREATE POLICY "Users can see messages in their conversations"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM public.chat_conversations
      WHERE participant_ids @> ARRAY[auth.uid()]
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM public.chat_conversations
      WHERE participant_ids @> ARRAY[auth.uid()]
    )
  );