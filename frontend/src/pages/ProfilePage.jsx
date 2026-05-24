import { useState } from "react";
import { Camera, Save, Loader2, MapPin } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Avatar from "../components/Avatar";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeOnboarding } from "../lib/api";
import { compressImage } from "../lib/imageUtils";
import toast from "react-hot-toast";

const AVATARS = Array.from({ length: 12 }, (_, i) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 1}&backgroundColor=b6e3f4,c0aede,d1f4d3,ffd5dc,ffdfbf`
);

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    profilePic: authUser?.profilePic || "",
    location: authUser?.location || "",
    lat: authUser?.lat || null,
    lon: authUser?.lon || null,
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile updated!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update profile"),
  });

  // ✅ Fixed: compress before converting to base64
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      toast.loading("Processing image...", { id: "img" });
      const compressed = await compressImage(file);
      setForm((f) => ({ ...f, profilePic: compressed }));
      toast.success("Photo ready!", { id: "img" });
    } catch {
      toast.error("Failed to process image", { id: "img" });
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    toast.loading("Detecting location...", { id: "loc" });
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const addr = data.address || {};
          const area = addr.suburb || addr.neighbourhood || addr.village || addr.hamlet;
          const city = addr.city || addr.town || addr.state || addr.county;
          const loc = area ? `${area}, ${city}` : city || "Unknown";
          setForm((f) => ({ ...f, location: loc, lat: latitude, lon: longitude }));
          toast.success("Location updated!", { id: "loc" });
        } catch { toast.error("Couldn't fetch location", { id: "loc" }); }
      },
      (err) => {
        toast.dismiss("loc");
        if (err.code === 1) toast.error("Location permission denied");
        else toast.error("Unable to get location");
      }
    );
  };

  return (
    <Sidebar>
      <div className="h-full overflow-auto px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl" style={{ color: "var(--text-primary)" }}>Profile</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Manage your public profile</p>
          </div>

          {/* Avatar section */}
          <div className="glass rounded-2xl p-6 mb-4">
            <h2 className="mb-4 font-display font-semibold text-sm uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Profile Photo
            </h2>
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar src={form.profilePic} name={form.fullName || authUser?.fullName} size="xl" />
                <label
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2"
                  style={{ background: "oklch(var(--p))", borderColor: "oklch(var(--b2))" }}
                >
                  <Camera size={13} className="text-white" />
                  {/* No capture attribute — lets user pick from gallery or camera */}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <div>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{authUser?.fullName}</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{authUser?.email}</p>
                <button
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="mt-2 text-xs font-medium hover:underline"
                  style={{ color: "oklch(var(--p))" }}
                >
                  {showAvatarPicker ? "Close picker" : "Choose avatar"}
                </button>
              </div>
            </div>

            {showAvatarPicker && (
              <div className="mt-5">
                <p className="mb-3 text-xs" style={{ color: "var(--text-muted)" }}>Select a preset avatar</p>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => { setForm({ ...form, profilePic: url }); setShowAvatarPicker(false); }}
                      className="rounded-xl overflow-hidden border-2 transition-all hover:scale-105"
                      style={{ borderColor: form.profilePic === url ? "oklch(var(--p))" : "transparent" }}
                    >
                      <img src={url} alt="" className="w-full aspect-square object-cover" />
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-secondary)" }}>Or paste an image URL</label>
                  <input
                    value={form.profilePic}
                    onChange={e => setForm({ ...form, profilePic: e.target.value })}
                    placeholder="https://..."
                    className="input-field text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Personal Info */}
          <div className="glass rounded-2xl p-6 mb-4">
            <h2 className="mb-4 font-display font-semibold text-sm uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Personal Info
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Full Name</label>
                <input
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Jane Doe"
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell people about yourself..."
                  rows={3}
                  className="input-field resize-none"
                  maxLength={200}
                />
                <p className="mt-1 text-right text-xs" style={{ color: "var(--text-muted)" }}>{form.bio.length}/200</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Location</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="City, Country"
                    className="input-field pl-10"
                  />
                </div>
                <button
                  type="button"
                  onClick={detectLocation}
                  className="mt-2 text-xs font-medium hover:underline"
                  style={{ color: "oklch(var(--p))" }}
                >
                  📍 Auto-detect my location
                </button>
              </div>
            </div>
          </div>

          {/* Account (read-only) */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="mb-4 font-display font-semibold text-sm uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Account
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Email</span>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{authUser?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Member since</span>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => saveProfile(form)}
            disabled={isPending}
            className="btn-brand w-full py-3 flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </Sidebar>
  );
};
export default ProfilePage;