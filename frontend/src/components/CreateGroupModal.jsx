import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Users, Search, Check, Loader2, Camera } from "lucide-react";
import { createGroup, getUserFriends } from "../lib/api";
import Avatar from "./Avatar";
import toast from "react-hot-toast";

const CreateGroupModal = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { mutate: createGroupMutation, isPending } = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      toast.success("Group created! 🎉");
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create group"),
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setGroupImage(reader.result);
    reader.readAsDataURL(file);
  };

  const toggleMember = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!groupName.trim()) return toast.error("Group name is required");
    if (selectedIds.length < 1) return toast.error("Add at least one member");
    createGroupMutation({ name: groupName.trim(), memberIds: selectedIds, image: groupImage });
  };

  const filtered = friends.filter((f) =>
    f.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="glass w-full max-w-md rounded-2xl animate-fade-in flex flex-col"
        style={{ border: "1px solid var(--border)", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <Users size={18} style={{ color: "oklch(var(--p))" }} />
            <h2 className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>
              New Group
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon h-8 w-8">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Group image */}
          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              <div
                className="h-20 w-20 rounded-full overflow-hidden flex items-center justify-center"
                style={{ background: "oklch(var(--b3))", border: "2px dashed var(--border)" }}
              >
                {groupImage ? (
                  <img src={groupImage} alt="group" className="h-full w-full object-cover" />
                ) : (
                  <Users size={28} style={{ color: "var(--text-muted)" }} />
                )}
              </div>
              <div
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2"
                style={{ background: "oklch(var(--p))", borderColor: "oklch(var(--b2))" }}
              >
                <Camera size={12} className="text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          {/* Group name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Group Name *
            </label>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Study Group, Dev Team…"
              className="input-field"
              maxLength={50}
            />
          </div>

          {/* Member search */}
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Add Members ({selectedIds.length} selected)
            </label>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your friends…"
                className="input-field pl-9 py-2 text-sm"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-muted)" }} />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-sm py-3" style={{ color: "var(--text-muted)" }}>
                No friends found
              </p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {filtered.map((f) => {
                  const selected = selectedIds.includes(f._id);
                  return (
                    <button
                      key={f._id}
                      onClick={() => toggleMember(f._id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 text-left"
                      style={{
                        background: selected ? "oklch(var(--p) / 0.1)" : "transparent",
                        border: selected ? "1px solid oklch(var(--p) / 0.3)" : "1px solid transparent",
                      }}
                    >
                      <Avatar src={f.profilePic} name={f.fullName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                          {f.fullName}
                        </p>
                        {f.location && (
                          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                            📍 {f.location}
                          </p>
                        )}
                      </div>
                      <div
                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all"
                        style={{
                          borderColor: selected ? "oklch(var(--p))" : "var(--border)",
                          background: selected ? "oklch(var(--p))" : "transparent",
                        }}
                      >
                        {selected && <Check size={11} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 px-6 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !groupName.trim() || selectedIds.length === 0}
            className="btn-brand flex-1 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isPending ? "Creating…" : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;