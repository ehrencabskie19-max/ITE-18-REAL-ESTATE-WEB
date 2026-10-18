<script setup lang="ts">
import L from 'leaflet'
import type { Property } from '~/stores/realEstate'

const props = defineProps<{ properties: Property[] }>()
const emit = defineEmits<{ select: [property: Property] }>()
const mapElement = ref<HTMLElement | null>(null)

let map: L.Map | undefined
let markerLayer: L.LayerGroup | undefined
let boundaryLayer: L.GeoJSON | undefined
let boundaryData: any

function renderLayers() {
  if (!map || !markerLayer) return
  markerLayer.clearLayers()
  boundaryLayer?.removeFrom(map)

  const located = props.properties.filter(property => property.latitude !== null && property.longitude !== null)
  const barangayIds = new Set(located.map(property => property.barangay_id))
  if (boundaryData) {
    const visibleBoundaries = {
      ...boundaryData,
      features: boundaryData.features.filter((feature: { properties?: { barangay_id?: number } }) => barangayIds.has(feature.properties?.barangay_id ?? -1))
    }
    boundaryLayer = L.geoJSON(visibleBoundaries, {
      style: { color: '#b98743', weight: 2, fillColor: '#e5c99c', fillOpacity: 0.18 },
      onEachFeature: (feature, layer) => layer.bindTooltip(String(feature.properties?.name || 'Barangay'))
    }).addTo(map)
  }

  located.forEach(property => {
    const marker = L.marker([property.latitude!, property.longitude!], {
      icon: L.divIcon({
        className: 'listing-map-marker',
        html: `<span>${property.listing_type === 'sale' ? 'BUY' : 'RENT'}</span>`,
        iconSize: [48, 28],
        iconAnchor: [24, 28]
      })
    })
    marker.bindTooltip(property.title)
    marker.on('click', () => emit('select', property))
    marker.addTo(markerLayer!)
  })

  if (located.length) {
    const bounds = L.latLngBounds(located.map(property => [property.latitude!, property.longitude!] as [number, number]))
    map.fitBounds(bounds.pad(0.2), { maxZoom: 13 })
  } else {
    map.setView([8.4, 124.8], 6)
  }
}

onMounted(async () => {
  if (!mapElement.value) return
  map = L.map(mapElement.value, { scrollWheelZoom: false }).setView([8.4, 124.8], 6)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)
  markerLayer = L.layerGroup().addTo(map)
  try {
    const response = await fetch('/data/barangay-boundaries.geojson')
    if (response.ok) boundaryData = await response.json()
  } catch {
    boundaryData = null
  }
  renderLayers()
  requestAnimationFrame(() => map?.invalidateSize())
})

watch(() => props.properties, renderLayers, { deep: true })
onBeforeUnmount(() => map?.remove())
</script>

<template>
  <div ref="mapElement" class="property-map" role="application" aria-label="Property map with barangay boundary overlays"></div>
</template>