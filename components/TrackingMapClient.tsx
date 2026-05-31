"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

export type LatLng = [number, number];

interface Props {
  from: LatLng;
  to: LatLng;
  driverPos: LatLng;
  progress: number; // 0–1
}

function makeSvg(color: string) {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="34" viewBox="0 0 28 34"><path d="M14 1C8 1 3 6 3 12c0 7.5 11 21 11 21s11-13.5 11-21C25 6 20 1 14 1z" fill="${color}" stroke="white" stroke-width="1.5"/><circle cx="14" cy="12" r="4" fill="white"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`;
}

export default function TrackingMapClient({ from, to, driverPos }: Props) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<any>(null);
  const driverRef      = useRef<any>(null);
  const initializingRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initializingRef.current) return;
    initializingRef.current = true;

    import("leaflet").then(async (L) => {
      if (!containerRef.current || (containerRef.current as any)._leaflet_id) {
        initializingRef.current = false;
        return;
      }

      const bounds = L.latLngBounds([from, to]);
      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
      }).fitBounds(bounds, { padding: [50, 50] });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      mapRef.current = map;

      // Route line
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?geometries=geojson&overview=full`;
        const data = await fetch(url).then(r => r.json());
        const coords = data.routes?.[0]?.geometry?.coordinates;
        if (coords) {
          const pts = coords.map(([lng, lat]: number[]) => [lat, lng]);
          // Dashed grey background
          L.polyline(pts, { color: "#ffffff", weight: 5, opacity: 0.08 }).addTo(map);
          // Yellow route
          L.polyline(pts, { color: "#C8F135", weight: 4, opacity: 0.9 }).addTo(map);
          map.fitBounds(L.latLngBounds(pts), { padding: [50, 50] });
        }
      } catch {
        L.polyline([from, to], { color: "#C8F135", weight: 3, dashArray: "8 6", opacity: 0.7 }).addTo(map);
      }

      // From dot
      L.marker(from, {
        icon: L.divIcon({
          html: `<div style="width:16px;height:16px;background:#22C55E;border:3px solid white;border-radius:50%;box-shadow:0 0 0 5px rgba(34,197,94,0.25)"></div>`,
          className: "",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      }).addTo(map);

      // To pin
      L.marker(to, {
        icon: L.icon({ iconUrl: makeSvg("#EF4444"), iconSize: [28, 34], iconAnchor: [14, 34] }),
      }).addTo(map);

      // Driver truck
      const driverIcon = L.divIcon({
        html: `<div style="width:46px;height:46px;background:#C8F135;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 4px 20px rgba(200,241,53,0.55)">🚐</div>`,
        className: "",
        iconSize: [46, 46],
        iconAnchor: [23, 23],
      });
      driverRef.current = L.marker(driverPos, { icon: driverIcon, zIndexOffset: 1000 }).addTo(map);
    });

    return () => {
      initializingRef.current = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        driverRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smooth driver position update
  useEffect(() => {
    driverRef.current?.setLatLng(driverPos);
  }, [driverPos]);

  return <div ref={containerRef} className="w-full h-full" />;
}
