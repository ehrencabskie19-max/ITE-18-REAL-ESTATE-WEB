import { defineStore } from 'pinia'

export type Property = {
  id: number
  professional_id: number
  tenant_id: number | null
  barangay_id: number
  title: string
  description: string
  listing_type: 'sale' | 'rent'
  property_type: 'house' | 'condo' | 'apartment' | 'lot'
  price: number
  floor_area: number
  lot_area: number
  bedrooms: number
  bathrooms: number
  address_line: string
  latitude: number | null
  longitude: number | null
  listing_status: 'available' | 'sold' | 'rented'
  created_at: string
  updated_at: string
}

type Region = { id: number; name: string }
type Province = { id: number; region_id: number; name: string }
type CityMunicipality = { id: number; province_id: number; name: string }
type Barangay = { id: number; city_municipality_id: number; name: string }
type User = { id: number; name: string; email: string; phone_number: string; role: 'user' | 'professional' | 'admin'; account_status: 'active' | 'inactive' | 'suspended'; created_at: string; updated_at: string }
type ProfessionalProfile = { id: number; user_id: number; license_number: string; agency_name: string; phone: string; verification_status: 'pending' | 'verified' | 'rejected'; created_at: string; updated_at: string }
type PropertyImage = { id: number; property_id: number; image_url: string; display_order: number; created_at: string }
type Favorite = { user_id: number; property_id: number; created_at: string }
type Inquiry = { id: number; property_id: number; user_id: number; professional_id: number; message: string; inquiry_status: 'new' | 'contacted' | 'closed'; created_at: string; updated_at: string }
export type PropertySize = 'all' | 'small' | 'medium' | 'large'

const demoTimestamp = '2026-10-01T09:00:00.000Z'

export const useRealEstateStore = defineStore('realEstate', {
  state: () => ({
    regions: [
      { id: 1, name: 'Caraga' }
    ] as Region[],
    provinces: [
      { id: 1, region_id: 1, name: 'Agusan del Norte' }
    ] as Province[],
    citiesMunicipalities: [
      { id: 1, province_id: 1, name: 'Butuan City' }
    ] as CityMunicipality[],
    barangays: [
      { id: 1, city_municipality_id: 1, name: 'Villa Kananga' },
      { id: 3, city_municipality_id: 1, name: 'Ampayon' }
    ] as Barangay[],
    users: [
      { id: 1, name: 'Ehren Cabodobd', email: 'ehren@example.test', phone_number: '+63 917 100 1001', role: 'professional' as const, account_status: 'active' as const, created_at: demoTimestamp, updated_at: demoTimestamp },
      { id: 2, name: 'Gio Setarios', email: 'gio@example.test', phone_number: '+63 917 100 1002', role: 'professional' as const, account_status: 'active' as const, created_at: demoTimestamp, updated_at: demoTimestamp },
      { id: 3, name: 'Lord Benjamen', email: 'lord@example.test', phone_number: '+63 917 100 1003', role: 'professional' as const, account_status: 'active' as const, created_at: demoTimestamp, updated_at: demoTimestamp },
      { id: 4, name: 'Demo Buyer', email: 'buyer@example.test', phone_number: '', role: 'user' as const, account_status: 'active' as const, created_at: demoTimestamp, updated_at: demoTimestamp }
    ] as User[],
    professionalProfiles: [
      { id: 1, user_id: 1, license_number: 'PRC-RE-10241', agency_name: 'KayaHomes Real Estate', phone: '+63 917 100 1001', verification_status: 'verified' as const, created_at: demoTimestamp, updated_at: demoTimestamp },
      { id: 2, user_id: 2, license_number: 'PRC-RE-20418', agency_name: 'Northstar Property Network', phone: '+63 917 100 1002', verification_status: 'verified' as const, created_at: demoTimestamp, updated_at: demoTimestamp },
      { id: 3, user_id: 3, license_number: 'PRC-RE-31908', agency_name: 'Vista Home Realty', phone: '+63 917 100 1003', verification_status: 'verified' as const, created_at: demoTimestamp, updated_at: demoTimestamp }
    ] as ProfessionalProfile[],
    properties: [
      { id: 1, professional_id: 1, tenant_id: null, barangay_id: 1, title: 'Modern Family House', description: 'A bright and spacious family home with a welcoming living area, practical kitchen, and a private garden. Great for families looking for comfort and convenience.', listing_type: 'sale', property_type: 'house', price: 4850000, floor_area: 118, lot_area: 150, bedrooms: 3, bathrooms: 2, address_line: 'Villa Kananga', latitude: 8.9634, longitude: 125.5124, listing_status: 'available', created_at: demoTimestamp, updated_at: demoTimestamp },
      { id: 2, professional_id: 2, tenant_id: null, barangay_id: 1, title: 'City View Condominium', description: 'Contemporary condo unit with natural light and convenient access to shops, restaurants, and transport links.', listing_type: 'rent', property_type: 'condo', price: 18500, floor_area: 58, lot_area: 0, bedrooms: 2, bathrooms: 1, address_line: 'Villa Kananga', latitude: 8.9615, longitude: 125.5160, listing_status: 'available', created_at: demoTimestamp, updated_at: demoTimestamp },
      { id: 3, professional_id: 1, tenant_id: null, barangay_id: 3, title: 'Peaceful Subdivision Home', description: 'A comfortable home in a peaceful neighborhood, with a functional layout and room for everyday family life.', listing_type: 'sale', property_type: 'house', price: 3200000, floor_area: 92, lot_area: 120, bedrooms: 3, bathrooms: 2, address_line: 'Ampayon', latitude: 8.9321, longitude: 125.5432, listing_status: 'available', created_at: demoTimestamp, updated_at: demoTimestamp },
      { id: 4, professional_id: 3, tenant_id: null, barangay_id: 3, title: 'Residential Lot Opportunity', description: 'A level residential lot with access to the main road, suitable for planning your future home.', listing_type: 'sale', property_type: 'lot', price: 1450000, floor_area: 0, lot_area: 180, bedrooms: 0, bathrooms: 0, address_line: 'Ampayon', latitude: 8.9340, longitude: 125.5400, listing_status: 'available', created_at: demoTimestamp, updated_at: demoTimestamp },
      { id: 5, professional_id: 2, tenant_id: null, barangay_id: 3, title: 'Minimal Apartment Unit', description: 'A neat apartment with a simple layout, good daylight, and convenient access to everyday essentials.', listing_type: 'rent', property_type: 'apartment', price: 12000, floor_area: 48, lot_area: 0, bedrooms: 2, bathrooms: 1, address_line: 'Ampayon', latitude: 8.9290, longitude: 125.5460, listing_status: 'available', created_at: demoTimestamp, updated_at: demoTimestamp },
      { id: 6, professional_id: 3, tenant_id: null, barangay_id: 1, title: 'Premium Modern Residence', description: 'A modern residence with generous living spaces, elegant finishes, and an outdoor area for entertaining.', listing_type: 'sale', property_type: 'house', price: 7600000, floor_area: 185, lot_area: 220, bedrooms: 4, bathrooms: 3, address_line: 'Villa Kananga', latitude: 8.9660, longitude: 125.5090, listing_status: 'available', created_at: demoTimestamp, updated_at: demoTimestamp }
    ] as Property[],
    propertyImages: [
      { id: 1, property_id: 1, image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85', display_order: 1, created_at: demoTimestamp },
      { id: 2, property_id: 2, image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85', display_order: 1, created_at: demoTimestamp },
      { id: 3, property_id: 3, image_url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85', display_order: 1, created_at: demoTimestamp },
      { id: 4, property_id: 4, image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85', display_order: 1, created_at: demoTimestamp },
      { id: 5, property_id: 5, image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85', display_order: 1, created_at: demoTimestamp },
      { id: 6, property_id: 6, image_url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85', display_order: 1, created_at: demoTimestamp }
    ] as PropertyImage[],
    favorites: [] as Favorite[],
    onlyFavorites: false,
    inquiries: [] as Inquiry[],
    search: '',
    typeFilter: 'all',
    listingFilter: 'all',
    sizeFilter: 'all' as PropertySize,
    cityFilter: 'all',
    agencyFilter: 'all'
  }),
  getters: {
    availableProperties: (state) => state.properties.filter(property => property.listing_status === 'available'),
    filteredProperties(state) {
      return state.properties.filter(property => {
        const query = state.search.toLowerCase().trim()
        const barangay = state.barangays.find(item => item.id === property.barangay_id)
        const city = state.citiesMunicipalities.find(item => item.id === barangay?.city_municipality_id)
        const province = state.provinces.find(item => item.id === city?.province_id)
        const region = state.regions.find(item => item.id === province?.region_id)
        const location = [property.address_line, barangay?.name, city?.name, province?.name, region?.name].join(' ').toLowerCase()
        const matchesText = !query || `${property.title} ${location} ${property.property_type}`.toLowerCase().includes(query)
        const matchesType = state.typeFilter === 'all' || property.property_type === state.typeFilter
        const matchesListing = state.listingFilter === 'all' || property.listing_type === state.listingFilter
        const area = property.floor_area || property.lot_area
        const matchesSize = state.sizeFilter === 'all'
          || (state.sizeFilter === 'small' && area < 80)
          || (state.sizeFilter === 'medium' && area >= 80 && area <= 150)
          || (state.sizeFilter === 'large' && area > 150)
        const matchesCity = state.cityFilter === 'all' || String(city?.id) === state.cityFilter
        const profile = state.professionalProfiles.find(item => item.id === property.professional_id)
        const matchesAgency = state.agencyFilter === 'all' || profile?.agency_name === state.agencyFilter
        const matchesFavorites = !state.onlyFavorites || state.favorites.some(favorite => favorite.user_id === 4 && favorite.property_id === property.id)
        return property.listing_status === 'available' && matchesText && matchesType && matchesListing && matchesSize && matchesCity && matchesAgency && matchesFavorites
      })
    },
    professionalDirectory: (state) => state.professionalProfiles.map(profile => ({
      ...profile,
      user: state.users.find(user => user.id === profile.user_id)
    })),
    agentCount: (state) => state.professionalProfiles.length,
    isFavorite: (state) => (propertyId: number) => state.favorites.some(favorite => favorite.user_id === 4 && favorite.property_id === propertyId)
  },
  actions: {
    toggleFavorite(propertyId: number) {
      const existing = this.favorites.find(favorite => favorite.user_id === 4 && favorite.property_id === propertyId)
      this.favorites = existing
        ? this.favorites.filter(favorite => favorite !== existing)
        : [...this.favorites, { user_id: 4, property_id: propertyId, created_at: new Date().toISOString() }]
    },
    toggleFavoritesOnly() {
      this.onlyFavorites = !this.onlyFavorites
    },
    resetFilters() {
      this.search = ''
      this.typeFilter = 'all'
      this.listingFilter = 'all'
      this.listingFilter = 'all'
      this.sizeFilter = 'all'
      this.cityFilter = 'all'
      this.agencyFilter = 'all'
      this.onlyFavorites = false
    },
    submitInquiry(payload: { property_id: number; name: string; email: string; phone: string; message: string }) {
      const property = this.properties.find(item => item.id === payload.property_id)
      if (!property) return

      const now = new Date().toISOString()
      const email = payload.email.trim().toLowerCase()
      let user = this.users.find(item => item.email.toLowerCase() === email)
      if (!user) {
        user = {
          id: Math.max(0, ...this.users.map(item => item.id)) + 1,
          name: payload.name.trim(),
          email,
          phone_number: payload.phone.trim(),
          role: 'user',
          account_status: 'active',
          created_at: now,
          updated_at: now
        }
        this.users.push(user)
      } else {
        user.name = payload.name.trim()
        user.phone_number = payload.phone.trim()
        user.updated_at = now
      }

      this.inquiries.unshift({
        id: Math.max(0, ...this.inquiries.map(item => item.id)) + 1,
        property_id: property.id,
        user_id: user.id,
        professional_id: property.professional_id,
        message: payload.message.trim(),
        inquiry_status: 'new',
        created_at: now,
        updated_at: now
      })
    }
  }
})
