-- Fix RLS policies for quiz_attempts to allow users to view their own attempts
-- This migration adds the missing policies for regular users

-- Ensure users can view their own quiz attempts
CREATE POLICY "Users can view own quiz attempts"
ON public.quiz_attempts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Ensure users can create their own quiz attempts
CREATE POLICY "Users can create own quiz attempts"
ON public.quiz_attempts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure users can update their own quiz attempts
CREATE POLICY "Users can update own quiz attempts"
ON public.quiz_attempts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
