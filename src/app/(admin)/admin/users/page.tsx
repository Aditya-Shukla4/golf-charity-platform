import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Users } from "lucide-react";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: users } = await supabase
    .from("users")
    .select(
      `
      *,
      subscriptions (status, plan, current_period_end),
      golf_scores (score)
    `,
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-400 text-sm mt-1">
            {users?.length ?? 0} total users
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-4">
                  User
                </th>
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-4">
                  Role
                </th>
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-4">
                  Subscription
                </th>
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-4">
                  Scores
                </th>
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-4">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => {
                const sub = Array.isArray(u.subscriptions)
                  ? u.subscriptions[0]
                  : u.subscriptions;
                const scoreCount = Array.isArray(u.golf_scores)
                  ? u.golf_scores.length
                  : 0;
                return (
                  <tr
                    key={u.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white">
                        {u.full_name || "No name"}
                      </p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          u.role === "admin"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {sub ? (
                        <div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              sub.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {sub.status}
                          </span>
                          <p className="text-xs text-gray-600 mt-1 capitalize">
                            {sub.plan}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600">
                          No subscription
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white">{scoreCount}/5</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">
                        {formatDate(u.created_at)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(!users || users.length === 0) && (
            <div className="text-center py-16">
              <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No users yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
