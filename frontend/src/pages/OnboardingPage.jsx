import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronRight, Camera, MapPin } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeOnboarding } from "../lib/api";
import toast from "react-hot-toast";

const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=1&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=2&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=3&backgroundColor=d1f4d3",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=4&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=5&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=6&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=7&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=8&backgroundColor=d1f4d3",
];

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    fullName: authUser?.fullName || "",
    bio: "",
    profilePic: AVATARS[0],
    location: "",
    lat: null,
    lon: null,
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile set up! Welcome to TalkStream 🚀");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to save profile"),
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, profilePic: reader.result });
    reader.readAsDataURL(file);
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
          setForm(f => ({ ...f, location: loc, lat: latitude, lon: longitude }));
          toast.success("Location detected!", { id: "loc" });
        } catch { toast.error("Couldn't fetch location name", { id: "loc" }); }
      },
      (err) => {
        toast.dismiss("loc");
        if (err.code === 1) toast.error("Location permission denied");
        else toast.error("Unable to get location");
      }
    );
  };

  const handleSave = () => onboardingMutation(form);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 mesh-bg">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Step {step} of 2</span>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>{Math.round((step / 2) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "oklch(var(--b3))" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(step / 2) * 100}%`, background: "linear-gradient(90deg, oklch(var(--p)), oklch(var(--s)))" }} />
          </div>
        </div>

        <div className="glass rounded-2xl p-8 animate-fade-in">
          {/* Step 1: Avatar + name */}
          {step === 1 && (
            <div>
              <h2 className="mb-1 font-display font-bold text-xl" style={{ color: "var(--text-primary)" }}>Choose your avatar</h2>
              <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>Pick a preset or upload your own photo</p>

              {/* Current preview */}
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <img src={form.profilePic} alt="preview"
                    className="h-24 w-24 rounded-full object-cover border-4"
                    style={{ borderColor: "oklch(var(--p))" }} />
                  <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2"
                    style={{ background: "oklch(var(--p))", borderColor: "oklch(var(--b2))" }}>
                    <Camera size={13} className="text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              {/* Avatar grid */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {AVATARS.map((url, i) => (
                  <button key={i} onClick={() => setForm({ ...form, profilePic: url })}
                    className="rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105"
                    style={{ borderColor: form.profilePic === url ? "oklch(var(--p))" : "transparent" }}>
                    <img src={url} alt="" className="w-full aspect-square object-cover" />
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Full Name</label>
                <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Jane Doe" className="input-field" />
              </div>
            </div>
          )}

          {/* Step 2: Bio + location */}
          {step === 2 && (
            <div>
              <h2 className="mb-1 font-display font-bold text-xl" style={{ color: "var(--text-primary)" }}>About you</h2>
              <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>Tell others a bit about yourself</p>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Bio</label>
                  <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell the world about yourself..." rows={3} className="input-field resize-none" maxLength={200} />
                  <p className="mt-1 text-right text-xs" style={{ color: "var(--text-muted)" }}>{form.bio.length}/200</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Location</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                    <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                      placeholder="City, Country" className="input-field pl-10" />
                  </div>
                  <button type="button" onClick={detectLocation}
                    className="mt-2 text-xs font-medium hover:underline" style={{ color: "oklch(var(--p))" }}>
                    📍 Auto-detect my location
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1">Back</button>
            )}
            {step < 2 ? (
              <button onClick={() => setStep(step + 1)}
                className="btn-brand flex-1 flex items-center justify-center gap-2">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSave} disabled={isPending}
                className="btn-brand flex-1 flex items-center justify-center gap-2">
                {isPending && <Loader2 size={16} className="animate-spin" />}
                {isPending ? "Saving..." : "Complete Setup 🚀"}
              </button>
            )}
          </div>
          {step === 2 && (
            <button onClick={() => navigate("/")} className="mt-3 w-full text-center text-sm"
              style={{ color: "var(--text-muted)" }}>
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default OnboardingPage;
