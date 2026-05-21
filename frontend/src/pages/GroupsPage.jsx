import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, Loader2, LogOut } from "lucide-react";
import Sidebar from "../components/Sidebar";
import CreateGroupModal from "../components/CreateGroupModal";
import { getMyGroups, leaveGroup } from "../lib/api";
import toast from "react-hot-toast";

const GroupsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["myGroups"],
    queryFn: getMyGroups,
  });

  const { mutate: leave } = useMutation({
    mutationFn: leaveGroup,
    onSuccess: () => {
      toast.success("Left group");
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
    },
    onError: () => toast.error("Failed to leave group"),
  });

  return (
    <Sidebar>
      <div className="h-full overflow-auto px-4 py-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl" style={{ color: "var(--text-primary)" }}>
              Groups
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              Your group conversations
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-brand flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            New Group
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && groups.length === 0 && (
          <div className="glass rounded-2xl p-16 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "oklch(var(--b3))" }}
            >
              <Users size={28} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>
              No groups yet
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Create your first group to start chatting with multiple friends
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-brand mt-5 flex items-center gap-2 mx-auto text-sm"
            >
              <Plus size={15} />
              Create a Group
            </button>
          </div>
        )}

        {/* Group list */}
        {!isLoading && groups.length > 0 && (
          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                className="glass-hover flex items-center gap-4 rounded-xl px-4 py-3 cursor-pointer"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                {/* Group icon / image */}
                <div
                  className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(var(--p) / 0.12)" }}
                >
                  {group.image ? (
                    <img src={group.image} alt={group.name} className="h-full w-full object-cover" />
                  ) : (
                    <Users size={20} style={{ color: "oklch(var(--p))" }} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {group.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
                    </span>
                    {group.lastMessage && (
                      <>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>·</span>
                        <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                          {group.lastMessage}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Leave button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Leave "${group.name}"?`)) leave(group.id);
                  }}
                  className="btn-icon h-8 w-8 flex-shrink-0"
                  title="Leave group"
                  style={{ color: "oklch(var(--er))" }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}
    </Sidebar>
  );
};

export default GroupsPage;