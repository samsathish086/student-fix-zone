CREATE POLICY "staff updates reports" ON public.reports
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'staff'))
WITH CHECK (public.has_role(auth.uid(), 'staff'));