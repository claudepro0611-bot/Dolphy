'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function MapFix() {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
  }, [map])
  return null
}

export default function TgMapView() {
  return (
    <MapContainer
      center={[41.2995, 69.2401]}
      zoom={13}
      zoomControl={false}
      attributionControl={false}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      <MapFix />
    </MapContainer>
  )
}
