import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const SUPER_ADMIN_EMAIL = "ssegwanyibillgates@gmail.com";

async function assertSuperAdmin(email: string | undefined | null) {
  if (!email || email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Forbidden: super admin only");
  }
}

function emailFrom(ctx: any): string | undefined {
  return ctx?.context?.claims?.email as string | undefined;
}
function uidFrom(ctx: any): string {
  return ctx?.context?.userId as string;
}

// Self-bootstrap: if caller email === SUPER_ADMIN_EMAIL, grant admin role to themselves.
export const bootstrapSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async (ctx: any) => {
    await assertSuperAdmin(emailFrom(ctx));
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: uidFrom(ctx), role: "admin" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAllUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async (ctx: any) => {
    await assertSuperAdmin(emailFrom(ctx));
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw new Error(error.message);

    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const roleMap = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    }

    return list.users.map((u: any) => ({
      id: u.id,
      email: u.email ?? "",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at,
      confirmed: !!u.email_confirmed_at,
      roles: roleMap.get(u.id) ?? [],
      isSuperAdmin: (u.email ?? "").toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase(),
    }));
  });

export const grantAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => d)
  .handler(async (ctx: any) => {
    await assertSuperAdmin(emailFrom(ctx));
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: ctx.data.userId, role: "admin" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const revokeAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => d)
  .handler(async (ctx: any) => {
    await assertSuperAdmin(emailFrom(ctx));
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: target, error: getErr } = await supabaseAdmin.auth.admin.getUserById(ctx.data.userId);
    if (getErr) throw new Error(getErr.message);
    if ((target.user?.email ?? "").toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      throw new Error("Cannot revoke the super admin");
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", ctx.data.userId)
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => d)
  .handler(async (ctx: any) => {
    await assertSuperAdmin(emailFrom(ctx));
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: target, error: getErr } = await supabaseAdmin.auth.admin.getUserById(ctx.data.userId);
    if (getErr) throw new Error(getErr.message);
    if ((target.user?.email ?? "").toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      throw new Error("Cannot delete the super admin");
    }
    if (ctx.data.userId === uidFrom(ctx)) {
      throw new Error("Cannot delete your own account from here");
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(ctx.data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
