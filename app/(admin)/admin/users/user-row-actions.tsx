"use client";

import { useActionState } from "react";
import { updateUserRoleAction, updateUserStatusAction, type AdminActionState } from "@/actions/admin";

const initialState: AdminActionState = {};

export function UserRowActions({ userId, role, status }: { userId: string; role: string; status: string }) {
  const [, roleAction] = useActionState(updateUserRoleAction, initialState);
  const [, statusAction] = useActionState(updateUserStatusAction, initialState);

  return (
    <div className="flex gap-2">
      <form action={roleAction}>
        <input type="hidden" name="userId" value={userId} />
        <select
          name="role"
          defaultValue={role}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="text-xs rounded-lg border border-border bg-white/5 px-2 py-1"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </form>
      <form action={statusAction}>
        <input type="hidden" name="userId" value={userId} />
        <select
          name="status"
          defaultValue={status}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="text-xs rounded-lg border border-border bg-white/5 px-2 py-1"
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="BANNED">BANNED</option>
        </select>
      </form>
    </div>
  );
}
