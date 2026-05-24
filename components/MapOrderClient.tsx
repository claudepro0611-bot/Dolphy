"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useCallback } from "react";

export type LatLng = [number, number];

interface Props {
  fromPos: LatLng | null;
  toPos: LatLng | null;
  userPos: LatLng | null;
  onFromChange: (pos: LatLng, address: string) => void;
  onToChange: (pos: LatLng, address: string) => void;
  activePin: "from" | "to" | null;
}

const TASHKENT: LatLng = [41.2995, 69.2401];

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers: { "Accept-Language": "uz,ru" } }
    );
    const d = await res.json();
    const r = d.address ?? {};
    const parts = [r.road, r.suburb, r.city_district, r.city].filter(Boolean);
    return parts.slice(0, 2).join(", ") || d.display_name?.split(",")[0] || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

function makeSvgIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44"><defs><filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.4"/></filter></defs><path d="M18 2C10.28 2 4 8.28 4 16C4 26 18 42 18 42C18 42 32 26 32 16C32 8.28 25.72 2 18 2Z" fill="${color}" filter="url(%23s)"/><circle cx="18" cy="16" r="6" fill="white" opacity="0.95"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function MapOrderClient({
  fromPos, toPos, userPos, onFromChange, onToChange, activePin
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const fromMarkerRef = useRef<any>(null);
  const toMarkerRef   = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const LRef          = useRef<any>(null);
  // Guards against React StrictMode double-invocation
  const initializingRef = useRef(false);

  const drawRoute = useCallback(async (L: any, map: any, a: LatLng, b: LatLng) => {
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?geometries=geojson&overview=full`;
      const res  = await fetch(url);
      const data = await res.json();
      const coords = data.routes?.[0]?.geometry?.coordinates;
      if (coords) {
        const latlngs = coords.map(([lng, lat]: number[]) => [lat, lng]);
        routeLayerRef.current = L.polyline(latlngs, { color: "#FFD100", weight: 4, opacity: 0.9 }).addTo(map);
        map.fitBounds(routeLayerRef.current.getBounds(), { padding: [80, 80] });
      }
    } catch {
      routeLayerRef.current = L.polyline([a, b], {
        color: "#FFD100", weight: 3, opacity: 0.65, dashArray: "8 6"
      }).addTo(map);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    // Prevent double-init (React StrictMode mounts twice in dev)
    if (initializingRef.current || mapRef.current) return;
    initializingRef.current = true;

    import("leaflet").then((L) => {
      // Container may have been removed during async gap
      if (!containerRef.current) { initializingRef.current = false; return; }
      // Leaflet internal guard
      if ((containerRef.current as any)._leaflet_id) { initializingRef.current = false; return; }

      LRef.current = L;
      const center = userPos || fromPos || TASHKENT;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(center, 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.attribution({ position: "bottomright", prefix: "© OpenStreetMap" }).addTo(map);

      mapRef.current = map;

      // User dot
      if (userPos) {
        const icon = L.divIcon({
          html: `<div style="width:14px;height:14px;background:#4F8EF7;border:3px solid white;border-radius:50%;box-shadow:0 0 0 5px rgba(79,142,247,0.25)"></div>`,
          className: "",
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker(userPos, { icon, zIndexOffset: 100 }).addTo(map);
      }

      // From marker
      const fromIcon = L.icon({ iconUrl: makeSvgIcon("#22C55E"), iconSize: [36, 44], iconAnchor: [18, 44] });
      const initFrom = fromPos || userPos || center;
      const fromMarker = L.marker(initFrom, { icon: fromIcon, draggable: true }).addTo(map);
      fromMarkerRef.current = fromMarker;
      fromMarker.on("dragend", async (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        const addr = await reverseGeocode(lat, lng);
        onFromChange([lat, lng], addr);
      });

      // To marker
      const toIcon = L.icon({ iconUrl: makeSvgIcon("#EF4444"), iconSize: [36, 44], iconAnchor: [18, 44] });
      const initTo: LatLng = toPos || [center[0] + 0.018, center[1] + 0.022];
      const toMarker = L.marker(initTo, { icon: toIcon, draggable: true }).addTo(map);
      toMarkerRef.current = toMarker;
      toMarker.on("dragend", async (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        const addr = await reverseGeocode(lat, lng);
        onToChange([lat, lng], addr);
      });

      drawRoute(L, map, initFrom, initTo);
    });

    return () => {
      initializingRef.current = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        fromMarkerRef.current = null;
        toMarkerRef.current   = null;
        routeLayerRef.current = null;
        LRef.current          = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync from marker + redraw route
  useEffect(() => {
    if (!mapRef.current || !LRef.current || !fromMarkerRef.current || !fromPos) return;
    fromMarkerRef.current.setLatLng(fromPos);
    if (toPos) drawRoute(LRef.current, mapRef.current, fromPos, toPos);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromPos]);

  // Sync to marker + redraw route
  useEffect(() => {
    if (!mapRef.current || !LRef.current || !toMarkerRef.current || !toPos) return;
    toMarkerRef.current.setLatLng(toPos);
    if (fromPos) drawRoute(LRef.current, mapRef.current, fromPos, toPos);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toPos]);

  // Re-bind click handler when activePin changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.off("click");
    if (!activePin) return;
    mapRef.current.on("click", async (e: any) => {
      const { lat, lng } = e.latlng;
      const addr = await reverseGeocode(lat, lng);
      if (activePin === "from") {
        fromMarkerRef.current?.setLatLng([lat, lng]);
        onFromChange([lat, lng], addr);
      } else {
        toMarkerRef.current?.setLatLng([lat, lng]);
        onToChange([lat, lng], addr);
      }
    });
  }, [activePin, onFromChange, onToChange]);

  return <div ref={containerRef} className="w-full h-full" />;
}
