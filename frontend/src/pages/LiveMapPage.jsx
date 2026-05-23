import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFriendsLocations } from "../lib/api";
import { Link } from "react-router-dom";
import { MapPinIcon, RefreshCwIcon, MessageSquareIcon, UserIcon, WifiIcon } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import Sidebar from "../components/Sidebar";

// Leaflet is loaded via CDN in index.html — accessed via window.L
// This avoids needing to install the npm package

const REFRESH_INTERVAL = 30000; // 30 seconds

// Generate a coloured marker SVG for each user
function makeMarkerSvg(color = "#3d5afe", label = "?") {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <circle cx="18" cy="18" r="17" fill="${color}" stroke="white" stroke-width="2.5"/>
      <text x="18" y="23" text-anchor="middle" font-size="13" font-family="Arial" font-weight="bold" fill="white">${label}</text>
      <polygon points="18,44 10,28 26,28" fill="${color}"/>
    </svg>
  `;
}

const FRIEND_COLORS = [
  "#3d5afe","#e91e63","#9c27b0","#00bcd4","#4caf50",
  "#ff9800","#f44336","#009688","#673ab7","#2196f3",
];

export default function LiveMapPage() {
  const { authUser } = useAuthUser();
  const mapRef = useRef(null);       // leaflet map instance
  const mapElRef = useRef(null);     // DOM div
  const markersRef = useRef({});     // { userId: L.marker }
  const [leafletReady, setLeafletReady] = useState(!!window.L);
  const [mapReady, setMapReady] = useState(false);
  const [selected, setSelected] = useState(null); // selected friend info

  const { data, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["friendsLocations"],
    queryFn: getFriendsLocations,
    refetchInterval: REFRESH_INTERVAL,
    staleTime: 0,
  });

  // Load Leaflet CSS + JS from CDN if not already loaded
  useEffect(() => {
    if (window.L) { setLeafletReady(true); return; }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setLeafletReady(true);
    document.head.appendChild(script);
  }, []);

  // Initialise map once Leaflet is ready and the div is mounted
  useEffect(() => {
    if (!leafletReady || !mapElRef.current || mapRef.current) return;

    const L = window.L;
    const map = L.map(mapElRef.current, { zoomControl: true }).setView([20, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setMapReady(true);
  }, [leafletReady]);

  // Place / update markers whenever data changes
  useEffect(() => {
    if (!mapReady || !data || !window.L) return;

    const L = window.L;
    const map = mapRef.current;
    const allUsers = [];

    // Helper to create/update a marker
    const upsertMarker = (user, color, isMe = false) => {
      if (!user.lat || !user.lon) return;
      const label = isMe ? "Me" : user.fullName?.[0]?.toUpperCase() || "?";
      const svgStr = makeMarkerSvg(isMe ? "#22c55e" : color, label);
      const icon = L.divIcon({
        html: svgStr,
        className: "",
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -44],
      });

      const popupContent = `
        <div style="min-width:160px; font-family: Arial, sans-serif;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            ${user.profilePic
              ? `<img src="${user.profilePic}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" />`
              : `<div style="width:36px;height:36px;border-radius:50%;background:${isMe ? "#22c55e" : color};display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">${label}</div>`
            }
            <div>
              <p style="margin:0;font-weight:bold;font-size:14px;">${user.fullName}${isMe ? " (You)" : ""}</p>
              ${user.location ? `<p style="margin:0;font-size:12px;opacity:.65;">${user.location}</p>` : ""}
            </div>
          </div>
          ${!isMe
            ? `<p style="margin:4px 0 0;font-size:11px;opacity:.5;text-align:right;">Tap to view profile</p>`
            : ""}
        </div>
      `;

      if (markersRef.current[user._id]) {
        markersRef.current[user._id].setLatLng([user.lat, user.lon]);
        markersRef.current[user._id].setIcon(icon);
      } else {
        const marker = L.marker([user.lat, user.lon], { icon })
          .addTo(map)
          .bindPopup(popupContent, { maxWidth: 220 });

        if (!isMe) {
          marker.on("click", () => setSelected(user));
        }

        markersRef.current[user._id] = marker;
      }

      allUsers.push(user);
    };

    // Plot current user
    if (data.me?.lat && data.me?.lon) {
      upsertMarker(data.me, "#22c55e", true);
    }

    // Plot friends
    (data.friends || []).forEach((friend, i) => {
      upsertMarker(friend, FRIEND_COLORS[i % FRIEND_COLORS.length], false);
    });

    // Remove markers for users no longer in the list
    const currentIds = new Set(allUsers.map((u) => String(u._id)));
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentIds.has(id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    // Fit map to all markers if we have multiple points
    if (allUsers.length > 1) {
      const bounds = L.latLngBounds(allUsers.map((u) => [u.lat, u.lon]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
    } else if (allUsers.length === 1) {
      map.setView([allUsers[0].lat, allUsers[0].lon], 10);
    }
  }, [mapReady, data]);

  const friendsWithLocation = data?.friends?.length ?? 0;
  const friendsWithoutLocation = (data?.friends ? data.friends.filter(f => !f.lat || !f.lon).length : 0);
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;

  const noLocation = !data?.me?.lat || !data?.me?.lon;

  return (
    <Sidebar>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between gap-4 px-5 py-4 shrink-0"
          style={{ background: "oklch(var(--b2))", borderBottom: "1px solid oklch(var(--bc)/0.08)" }}
        >
          <div>
            <h1 className="font-bold text-xl flex items-center gap-2" style={{ color: "oklch(var(--bc))" }}>
              <MapPinIcon size={20} className="text-primary" />
              Friends Map
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "oklch(var(--bc)/0.5)" }}>
              {friendsWithLocation} friend{friendsWithLocation !== 1 ? "s" : ""} with location
              {lastUpdated && ` · Updated ${lastUpdated}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={{ background: "oklch(var(--su)/0.12)", color: "oklch(var(--su))" }}>
              <WifiIcon size={12} />
              Live · {Math.round(REFRESH_INTERVAL / 1000)}s
            </div>
            <button
              onClick={() => refetch()}
              className="btn btn-ghost btn-sm btn-circle"
              title="Refresh now"
            >
              <RefreshCwIcon size={15} />
            </button>
          </div>
        </div>

        {/* No location warning */}
        {noLocation && !isLoading && (
          <div className="mx-4 mt-4 shrink-0 rounded-xl p-4 flex items-start gap-3"
            style={{ background: "oklch(var(--wa)/0.12)", border: "1px solid oklch(var(--wa)/0.3)" }}>
            <MapPinIcon size={18} style={{ color: "oklch(var(--wa))", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "oklch(var(--wac))" }}>
                Your location isn&apos;t set
              </p>
              <p className="text-xs mt-0.5" style={{ color: "oklch(var(--wac)/0.75)" }}>
                Go to{" "}
                <Link to="/profile" className="underline font-medium">Profile</Link>
                {" "}and tap &quot;Auto Detect Location&quot; to appear on the map.
              </p>
            </div>
          </div>
        )}

        {/* Main area */}
        <div className="flex flex-1 overflow-hidden gap-0">
          {/* Map */}
          <div className="flex-1 relative">
            {(!leafletReady || isLoading) && (
              <div className="absolute inset-0 z-10 flex items-center justify-center"
                style={{ background: "oklch(var(--b1))" }}>
                <div className="flex flex-col items-center gap-3">
                  <span className="loading loading-spinner loading-lg text-primary" />
                  <p className="text-sm" style={{ color: "oklch(var(--bc)/0.5)" }}>Loading map...</p>
                </div>
              </div>
            )}
            <div ref={mapElRef} className="w-full h-full" style={{ minHeight: 300 }} />
          </div>

          {/* Friends panel — desktop sidebar */}
          <div
            className="hidden lg:flex flex-col w-64 shrink-0 overflow-y-auto"
            style={{ borderLeft: "1px solid oklch(var(--bc)/0.08)", background: "oklch(var(--b2))" }}
          >
            <p className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "oklch(var(--bc)/0.4)" }}>
              On the map
            </p>

            {/* You */}
            {data?.me && (
              <button
                onClick={() => {
                  if (data.me.lat && mapRef.current) {
                    mapRef.current.flyTo([data.me.lat, data.me.lon], 13, { duration: 1 });
                    markersRef.current[data.me._id]?.openPopup();
                  }
                }}
                className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-base-300 w-full"
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-base-300">
                    {data.me.profilePic
                      ? <img src={data.me.profilePic} alt="" className="w-full h-full object-cover" />
                      : <span className="flex w-full h-full items-center justify-center font-bold text-sm">{authUser?.fullName?.[0]}</span>}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-base-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">You</p>
                  <p className="text-xs truncate" style={{ color: "oklch(var(--bc)/0.4)" }}>
                    {data.me.location || (data.me.lat ? `${data.me.lat.toFixed(2)}, ${data.me.lon.toFixed(2)}` : "No location")}
                  </p>
                </div>
              </button>
            )}

            <div className="divider my-1 mx-4" />

            {/* Friends */}
            {(data?.friends || []).length === 0 ? (
              <div className="px-4 py-6 text-center">
                <UserIcon size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs" style={{ color: "oklch(var(--bc)/0.4)" }}>
                  No friends with location yet
                </p>
              </div>
            ) : (
              (data.friends || []).map((friend, i) => (
                <button
                  key={friend._id}
                  onClick={() => {
                    if (friend.lat && mapRef.current) {
                      mapRef.current.flyTo([friend.lat, friend.lon], 13, { duration: 1 });
                      markersRef.current[friend._id]?.openPopup();
                    }
                    setSelected(friend);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-base-300 w-full"
                  style={{ opacity: friend.lat ? 1 : 0.4 }}
                >
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden"
                      style={{ background: FRIEND_COLORS[i % FRIEND_COLORS.length] + "33" }}>
                      {friend.profilePic
                        ? <img src={friend.profilePic} alt="" className="w-full h-full object-cover" />
                        : <span className="flex w-full h-full items-center justify-center font-bold text-sm"
                            style={{ color: FRIEND_COLORS[i % FRIEND_COLORS.length] }}>
                            {friend.fullName?.[0]}
                          </span>}
                    </div>
                    {friend.lat && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-base-200"
                        style={{ background: FRIEND_COLORS[i % FRIEND_COLORS.length] }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{friend.fullName}</p>
                    <p className="text-xs truncate" style={{ color: "oklch(var(--bc)/0.4)" }}>
                      {friend.location || (friend.lat ? `${friend.lat.toFixed(2)}, ${friend.lon.toFixed(2)}` : "No location shared")}
                    </p>
                  </div>
                </button>
              ))
            )}

            {friendsWithoutLocation > 0 && (
              <p className="px-4 pt-2 pb-4 text-xs" style={{ color: "oklch(var(--bc)/0.35)" }}>
                {friendsWithoutLocation} friend{friendsWithoutLocation > 1 ? "s" : ""} haven&apos;t shared their location yet.
              </p>
            )}
          </div>
        </div>

        {/* Selected friend action bar — mobile */}
        {selected && (
          <div
            className="lg:hidden flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ background: "oklch(var(--b2))", borderTop: "1px solid oklch(var(--bc)/0.08)" }}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-base-300 shrink-0">
              {selected.profilePic
                ? <img src={selected.profilePic} alt="" className="w-full h-full object-cover" />
                : <span className="flex w-full h-full items-center justify-center font-bold">{selected.fullName?.[0]}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{selected.fullName}</p>
              <p className="text-xs truncate" style={{ color: "oklch(var(--bc)/0.4)" }}>{selected.location || ""}</p>
            </div>
            <Link
              to={`/chat/${selected._id}`}
              className="btn btn-primary btn-sm gap-1.5"
            >
              <MessageSquareIcon size={14} />
              Chat
            </Link>
            <button onClick={() => setSelected(null)} className="btn btn-ghost btn-sm btn-circle">✕</button>
          </div>
        )}
      </div>
    </Sidebar>
  );
}