import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const resetStaffPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { staffUserId: string; newPassword: string }) => {
    if (!data.staffUserId) throw new Error("Missing staff user");
    if (!data.newPassword || data.newPassword.length < 8)
      throw new Error("Password must be at least 8 characters");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { data: isHost } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "host",
    });
    if (!isHost) throw new Error("Only the host can reset staff passwords");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.staffUserId, {
      password: data.newPassword,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
