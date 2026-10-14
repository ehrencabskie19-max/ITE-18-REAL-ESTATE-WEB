import { defineStore } from 'pinia'

export type Property = {
  id: number
  agent_id: number
  title: string
  description: string
  price: number
  listing_type: 'sale' | 'rent'
  property_type: 'house' | 'condo' | 'apartment' | 'lot'
  status: 'available' | 'sold' | 'rented'
  city: string
  address: string
  bedrooms: number
  bathrooms: number
  floor_area: number
  lot_area: number
  created_at: string
  image: string
  features: string[]
}

export const useRealEstateStore = defineStore('realEstate', {
  state: () => ({
    properties: [
      { id: 1, agent_id: 1, title: 'Modern Family House', description: 'A bright and spacious family home with a welcoming living area, practical kitchen, and a private garden. Great for families looking for comfort and convenience.', price: 4850000, listing_type: 'sale' as const, property_type: 'house' as const, status: 'available' as const, city: 'Butuan City', address: 'Villa Kananga, Butuan City', bedrooms: 3, bathrooms: 2, floor_area: 118, lot_area: 150, created_at: '2026-10-01', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85', features: ['Parking space', 'Garden', 'Fitted kitchen', 'Gated community'] },
      { id: 2, agent_id: 2, title: 'City View Condominium', description: 'Contemporary condo unit with natural light and convenient access to shops, restaurants, and transport links.', price: 18500, listing_type: 'rent' as const, property_type: 'condo' as const, status: 'available' as const, city: 'Cebu City', address: 'Cebu Business Park, Cebu City', bedrooms: 2, bathrooms: 1, floor_area: 58, lot_area: 0, created_at: '2026-09-25', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85', features: ['Pool access', 'Security', 'City view', 'Elevator'] },
      { id: 3, agent_id: 1, title: 'Peaceful Subdivision Home', description: 'A comfortable home in a peaceful neighborhood, with a functional layout and room for everyday family life.', price: 3200000, listing_type: 'sale' as const, property_type: 'house' as const, status: 'available' as const, city: 'Butuan City', address: 'Ampayon, Butuan City', bedrooms: 3, bathrooms: 2, floor_area: 92, lot_area: 120, created_at: '2026-09-18', image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85', features: ['Parking space', 'Covered patio', 'Near schools'] },
      { id: 4, agent_id: 3, title: 'Residential Lot Opportunity', description: 'A level residential lot with access to the main road, suitable for planning your future home.', price: 1450000, listing_type: 'sale' as const, property_type: 'lot' as const, status: 'available' as const, city: 'Cagayan de Oro', address: 'Lumbia, Cagayan de Oro', bedrooms: 0, bathrooms: 0, floor_area: 0, lot_area: 180, created_at: '2026-09-12', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85', features: ['Road access', 'Residential area', 'Level lot'] },
      { id: 5, agent_id: 2, title: 'Minimal Apartment Unit', description: 'A neat apartment with a simple layout, good daylight, and convenient access to everyday essentials.', price: 12000, listing_type: 'rent' as const, property_type: 'apartment' as const, status: 'available' as const, city: 'Davao City', address: 'Matina, Davao City', bedrooms: 2, bathrooms: 1, floor_area: 48, lot_area: 0, created_at: '2026-09-08', image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=85', features: ['Pet-friendly', 'Laundry area', 'Near transport'] },
      { id: 6, agent_id: 3, title: 'Premium Modern Residence', description: 'A modern residence with generous living spaces, elegant finishes, and an outdoor area for entertaining.', price: 7600000, listing_type: 'sale' as const, property_type: 'house' as const, status: 'available' as const, city: 'Davao City', address: 'Lanang, Davao City', bedrooms: 4, bathrooms: 3, floor_area: 185, lot_area: 220, created_at: '2026-09-03', image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85', features: ['Two-car garage', 'Garden', 'Master suite', 'Outdoor patio'] }
    ] as Property[],
    agents: [
      { id: 1, user_id: 2, name: 'Ehren Cabodobd', license_no: 'PRC-RE-10241', bio: 'Helping families find practical and comfortable homes.', photo: '/images/agent1.jpg' },
      { id: 2, user_id: 3, name: 'Gio Setarios', license_no: 'PRC-RE-20418', bio: 'Specialist in city condos and rental properties.', photo: '/images/agent2.jpg' },
      { id: 3, user_id: 4, name: 'Lord Benjamen', license_no: 'PRC-RE-31908', bio: 'Focused on residential lots and premium homes.', photo: '/images/agent3.jpg' }
    ],
    favorites: [] as number[],
    inquiries: [] as { id: number; property_id: number; user_id: number | null; name: string; email: string; phone: string; message: string; created_at: string }[],
    search: '',
    typeFilter: 'all',
    listingFilter: 'all',
    maxPrice: 10000000
  }),
  getters: {
    availableProperties: (state) => state.properties.filter(p => p.status === 'available'),
    filteredProperties(state) {
      return state.properties.filter(p => {
        const q = state.search.toLowerCase().trim()
        const matchesText = !q || `${p.title} ${p.city} ${p.address} ${p.property_type}`.toLowerCase().includes(q)
        const matchesType = state.typeFilter === 'all' || p.property_type === state.typeFilter
        const matchesListing = state.listingFilter === 'all' || p.listing_type === state.listingFilter
        return p.status === 'available' && matchesText && matchesType && matchesListing && p.price <= state.maxPrice
      })
    },
    agentCount: (state) => state.agents.length
  },
  actions: {
    toggleFavorite(id: number) {
      this.favorites = this.favorites.includes(id) ? this.favorites.filter(x => x !== id) : [...this.favorites, id]
    },
    submitInquiry(payload: { property_id: number; name: string; email: string; phone: string; message: string }) {
      this.inquiries.unshift({ id: Date.now(), ...payload, user_id: null, created_at: new Date().toISOString() })
    }
  }
})
