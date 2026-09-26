-- Prevent clients from setting quiz scores / pass status directly.
-- The grade_quiz_attempt SECURITY DEFINER function runs as its owner,
-- so it is not affected by this trigger; only the client roles are.
CREATE OR REPLACE FUNCTION public.protect_quiz_attempt_results()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF NEW.score IS DISTINCT FROM OLD.score
       OR NEW.is_passed IS DISTINCT FROM OLD.is_passed
       OR NEW.completed_at IS DISTINCT FROM OLD.completed_at THEN
      RAISE EXCEPTION 'Quiz results can only be set by the server grading function';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_quiz_attempt_results_trigger ON public.lms_quiz_attempts;
CREATE TRIGGER protect_quiz_attempt_results_trigger
BEFORE UPDATE ON public.lms_quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION public.protect_quiz_attempt_results();

-- Prevent clients from choosing their own booking price.
-- Authenticated/anon inserts and updates always get the default price;
-- only the service role (admin/backend) can set a different price.
CREATE OR REPLACE FUNCTION public.protect_sprint_booking_price()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.price_chf := 999;
    ELSE
      NEW.price_chf := OLD.price_chf;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_sprint_booking_price_trigger ON public.sprint_bookings;
CREATE TRIGGER protect_sprint_booking_price_trigger
BEFORE INSERT OR UPDATE ON public.sprint_bookings
FOR EACH ROW
EXECUTE FUNCTION public.protect_sprint_booking_price();