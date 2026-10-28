-- Lock down chat_messages for the public (anon) key used by the browser.
-- Anyone may read and post; nobody but the purge function and cron may update or delete.
-- Limits mirror app/utils/chat-identity.ts. Idempotent: safe to run twice.
--
-- NOT VALID: existing rows are not checked; new rows are. Rows expire within 10 minutes anyway.

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS chat_messages_public_read ON public.chat_messages;
CREATE POLICY chat_messages_public_read ON public.chat_messages
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS chat_messages_public_insert ON public.chat_messages;
CREATE POLICY chat_messages_public_insert ON public.chat_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- No UPDATE / DELETE policies: with RLS on, those are denied for anon and authenticated.

ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_length;
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_message_length
  CHECK (char_length(btrim(message)) BETWEEN 1 AND 500) NOT VALID;

ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_username_length;
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_username_length
  CHECK (char_length(btrim(username)) BETWEEN 1 AND 24) NOT VALID;

ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_country_code_format;
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_country_code_format
  CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$') NOT VALID;

-- The purge trigger deletes by age on every insert; index keeps it cheap.
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON public.chat_messages (created_at);
