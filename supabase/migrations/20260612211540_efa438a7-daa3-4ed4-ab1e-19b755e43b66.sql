DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['programs','live_streams','matches','ticker_headlines','site_settings','videos','news','competitions'] LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;