<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRealEstateStore, type Property } from '../stores/realEstate'

const store = useRealEstateStore()
const selected = ref<Property | null>(null)
const inquiryProperty = ref<Property | null>(null)
const form = reactive({ name: '', email: '', phone: '', message: '' })
const error = ref('')
const success = ref('')
const viewMode = ref<'list' | 'map'>('list')
const agentQuery = ref('')
const sellDialogOpen = ref(false)
const sellSubmitted = ref(false)
const sellForm = reactive({ name: '', email: '', phone: '', city: '', propertyType: 'house', details: '' })
const accountDialogOpen = ref(false)
const accountMode = ref<'login' | 'register'>('login')
const accountForm = reactive({ name: '', email: '', password: '', confirmPassword: '' })
const accountStatus = ref('')
const accountStatusKind = ref<'info' | 'error'>('info')
const mortgage = reactive({ price: 4850000, downPaymentPercent: 20, annualRate: 7, termYears: 20 })
const mortgageLoan = computed(() => Math.max(0, mortgage.price * (1 - mortgage.downPaymentPercent / 100)))
const mortgagePayment = computed(() => {
  const months = mortgage.termYears * 12
  const monthlyRate = mortgage.annualRate / 100 / 12
  if (!months) return 0
  return monthlyRate
    ? mortgageLoan.value * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months))
    : mortgageLoan.value / months
})
const mortgageInterest = computed(() => Math.max(0, mortgagePayment.value * mortgage.termYears * 12 - mortgageLoan.value))
const agencyOptions = computed(() => [...new Set(store.professionalProfiles.map(profile => profile.agency_name))].sort())
const filteredProfessionals = computed(() => {
  const query = agentQuery.value.trim().toLowerCase()
  return store.professionalDirectory.filter(profile => !query || [profile.user?.name, profile.agency_name, profile.license_number].join(' ').toLowerCase().includes(query))
})
const listingCode = (property: Property) => `MLS-${new Date(property.created_at).getFullYear()}-${String(property.id).padStart(5, '0')}`
const sizeLabel = (property: Property) => {
  const area = property.floor_area || property.lot_area
  return area < 80 ? 'Small' : area <= 150 ? 'Medium' : 'Large'
}

const money = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n)
const profileFor = (property: Property) => store.professionalProfiles.find(profile => profile.id === property.professional_id)
const agentFor = (property: Property) => store.users.find(user => user.id === profileFor(property)?.user_id)
const agentPhotoFor = (property: Property) => `/images/agent${profileFor(property)?.id || 1}.jpg`
const imageFor = (property: Property) => store.propertyImages.filter(image => image.property_id === property.id).sort((a, b) => a.display_order - b.display_order)[0]?.image_url || ''
const locationFor = (property: Property) => {
  const barangay = store.barangays.find(item => item.id === property.barangay_id)
  const city = store.citiesMunicipalities.find(item => item.id === barangay?.city_municipality_id)
  const province = store.provinces.find(item => item.id === city?.province_id)
  const region = store.regions.find(item => item.id === province?.region_id)
  const parts = [property.address_line, barangay?.name, city?.name, province?.name, region?.name].filter(Boolean)
  return [...new Set(parts)].join(', ')
}

function scrollToProperties() {
  if (import.meta.client) {
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })
  }
}

function showMapView() {
  viewMode.value = 'map'
  scrollToProperties()
}

function showListView() {
  viewMode.value = 'list'
  scrollToProperties()
}

function openInquiry(p: Property | null) {
  if (!p) return
  inquiryProperty.value = p
  form.name = ''
  form.email = ''
  form.phone = ''
  form.message = `I'm interested in ${p.title} (${locationFor(p)}).`
  error.value = ''
  success.value = ''
}

function submitInquiry() {
  error.value = ''
  success.value = ''
  if (!inquiryProperty.value) return
  if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
    error.value = 'Please complete your name, email, and message.'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    error.value = 'Please enter a valid email address.'
    return
  }
  if (form.phone && !/^[0-9+\-()\s]{7,20}$/.test(form.phone)) {
    error.value = 'Please enter a valid contact number.'
    return
  }
  store.submitInquiry({
    property_id: inquiryProperty.value.id,
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    message: form.message.trim()
  })
  success.value = 'Your inquiry has been recorded in this demo.'
  form.name = ''
  form.email = ''
  form.phone = ''
  form.message = ''
}

const clearFilters = () => {
  store.resetFilters()
}

function toggleFavoritesView() {
  store.toggleFavoritesOnly()
  scrollToProperties()
}

function showSellDialog() {
  sellSubmitted.value = false
  sellDialogOpen.value = true
}

function showAccountDialog(mode: 'login' | 'register' = 'login') {
  accountMode.value = mode
  accountForm.name = ''
  accountForm.email = ''
  accountForm.password = ''
  accountForm.confirmPassword = ''
  accountStatus.value = ''
  accountDialogOpen.value = true
}

function submitAccount() {
  accountStatusKind.value = 'info'
  if (accountMode.value === 'register' && accountForm.password !== accountForm.confirmPassword) {
    accountStatusKind.value = 'error'
    accountStatus.value = 'Passwords do not match.'
    return
  }
  accountStatus.value = accountMode.value === 'login'
    ? 'Demo only: sign-in is not connected.'
    : 'Demo only: account creation is not connected.'
}

function submitSellRequest() {
  sellSubmitted.value = true
}

function estimateMortgage(property: Property) {
  mortgage.price = property.price
  document.getElementById('mortgage')?.scrollIntoView({ behavior: 'smooth' })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    selected.value = null
    inquiryProperty.value = null
    accountDialogOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

watch([selected, inquiryProperty, accountDialogOpen], ([s, i, a]) => {
  if (import.meta.client) {
    document.body.style.overflow = (s || i || a) ? 'hidden' : ''
  }
})
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#" @click.prevent="selected = null">
        <span class="brand-mark">KH</span>
        <span class="brand-name">KayaHomes<small>REAL ESTATE</small></span>
      </a>
      <nav class="nav-links">
        <a href="#properties" @click.prevent="showListView">Properties</a><a href="#properties" @click.prevent="showMapView">Map</a><a href="#mortgage">Mortgage</a><a href="#agents">Agents</a><a href="/portal">Portals</a>
      </nav>
      <div class="topbar-actions">
        <button class="account-trigger" @click="showAccountDialog()">Log in</button>
        <button class="nav-cta" @click="showSellDialog">List a property <span>↗</span></button>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow"><span></span> FIND A PLACE TO CALL HOME</div>
          <h1>Find a place<br>where life <em>happens.</em></h1>
          <p>Thoughtfully selected homes, apartments, and lots to help you take the next step with confidence.</p>
          <div class="hero-actions"><a class="btn-primary" href="#properties" @click.prevent="showListView">Explore properties <span>↗</span></a><a class="text-link" href="#about">Discover our story</a></div>
          <div class="hero-stats"><div><strong>{{ store.properties.length }}+</strong><span>Sample listings</span></div><div><strong>{{ store.agentCount }}</strong><span>Property agents</span></div><div><strong>4.9/5</strong><span>Client experience*</span></div></div>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=90" alt="Modern house with landscaped garden">
          <div class="image-label"><span class="label-dot"></span><div><strong>Spaces for your next chapter</strong><small>Homes · Condos · Land</small></div></div>
          <div class="vertical-note">PROPERTY COLLECTION — 2026</div>
        </div>
      </section>

      <section class="trade-switch" aria-label="Choose a property service">
        <button :class="{ active: store.listingFilter === 'sale' }" @click="store.listingFilter = 'sale'; store.onlyFavorites = false">Buy</button>
        <button :class="{ active: store.listingFilter === 'rent' }" @click="store.listingFilter = 'rent'; store.onlyFavorites = false">Rent</button>
        <button class="sell-switch" @click="showSellDialog">Sell a property <span>↗</span></button>
      </section>

      <section id="properties" class="section properties-section">
        <div class="section-heading"><div><div class="eyebrow"><span></span> THE COLLECTION</div><h2>Find your <em>space.</em></h2><p>Explore places selected for the way you want to live.</p></div><button class="clear-btn" @click="clearFilters">Reset filters ↺</button></div>
        <section class="search-panel feature-search" aria-label="Search multiple listings">
          <div class="search-field search-keyword"><label for="search">LOCATION OR KEYWORD</label><div class="input-with-icon"><span>⌕</span><input id="search" v-model="store.search" placeholder="City, barangay, property..."></div></div>
          <div class="search-field"><label for="listing">LISTING TYPE</label><select id="listing" v-model="store.listingFilter"><option value="all">Buy or rent</option><option value="sale">For sale</option><option value="rent">For rent</option></select></div>
          <div class="search-field"><label for="type">PROPERTY TYPE</label><select id="type" v-model="store.typeFilter"><option value="all">All types</option><option value="house">House</option><option value="condo">Condominium</option><option value="apartment">Apartment</option><option value="lot">Lot / Land</option></select></div>
          <div class="search-field"><label for="city-filter">CITY / MUNICIPALITY</label><select id="city-filter" v-model="store.cityFilter"><option value="all">All locations</option><option v-for="city in store.citiesMunicipalities" :key="city.id" :value="String(city.id)">{{ city.name }}</option></select></div>
          <div class="search-field"><label for="size-filter">PROPERTY SIZE</label><select id="size-filter" v-model="store.sizeFilter"><option value="all">Any size</option><option value="small">Small · under 80 m²</option><option value="medium">Medium · 80–150 m²</option><option value="large">Large · over 150 m²</option></select></div>
          <div class="search-field"><label for="agency-filter">MLS NETWORK</label><select id="agency-filter" v-model="store.agencyFilter"><option value="all">All partner agencies</option><option v-for="agency in agencyOptions" :key="agency" :value="agency">{{ agency }}</option></select></div>
          <button class="search-button" @click="scrollToProperties">Search listings <span>↗</span></button>
        </section>
        <div class="listing-toolbar feature-toolbar">
          <div class="toolbar-left"><span><strong>{{ store.filteredProperties.length }}</strong> listings in the exchange</span><button class="saved-filter" :class="{ active: store.onlyFavorites }" @click="toggleFavoritesView">♥ Saved ({{ store.favorites.length }})</button></div>
          <div class="view-switch" role="tablist" aria-label="Listing view"><button :class="{ active: viewMode === 'list' }" role="tab" :aria-selected="viewMode === 'list'" @click="viewMode = 'list'">List</button><button :class="{ active: viewMode === 'map' }" role="tab" :aria-selected="viewMode === 'map'" @click="viewMode = 'map'">Map</button></div>
        </div>
        <div v-if="viewMode === 'map'" class="map-panel"><div class="map-heading"><strong>Listings by barangay</strong><span>Illustrative boundary outlines · verify official limits before use</span></div><ClientOnly><PropertyMap :properties="store.filteredProperties" @select="selected = $event" /><template #fallback><div class="map-loading">Loading map…</div></template></ClientOnly></div>
        <div v-else-if="store.filteredProperties.length" class="property-grid">
          <article v-for="p in store.filteredProperties" :key="p.id" class="property-card">
            <div class="card-image" @click="selected = p">
              <img :src="imageFor(p)" :alt="p.title">
              <span class="type-badge">{{ p.listing_type === 'sale' ? 'FOR SALE' : 'FOR RENT' }}</span>
              <button class="favorite-btn" :class="{ active: store.isFavorite(p.id) }" :aria-label="store.isFavorite(p.id) ? 'Remove from favorites' : 'Add to favorites'" @click.stop="store.toggleFavorite(p.id)">{{ store.isFavorite(p.id) ? '♥' : '♡' }}</button>
            </div>
            <div class="card-body">
              <div class="property-price">{{ money(p.price) }}<small v-if="p.listing_type === 'rent'"> / month</small></div>
              <div class="listing-code">{{ listingCode(p) }} <span>{{ sizeLabel(p) }} · {{ p.floor_area || p.lot_area }} m²</span></div>
              <button class="property-title" @click="selected = p">{{ p.title }} <span>↗</span></button>
              <div class="property-location">⌖ {{ locationFor(p) }}</div>
              <div class="card-divider"></div>
              <div class="property-meta"><span v-if="p.bedrooms">▱ {{ p.bedrooms }} beds</span><span v-if="p.bathrooms">♧ {{ p.bathrooms }} baths</span><span>↔ {{ p.floor_area || p.lot_area }} m²</span></div>
              <div class="card-bottom"><div class="agent-mini"><img :src="agentPhotoFor(p)" :alt="agentFor(p)?.name || 'Agent'"><span>{{ agentFor(p)?.name || 'Our agent' }}</span></div><button class="details-btn" @click="selected = p">Details ↗</button></div>
            </div>
          </article>
        </div>
        <div v-else-if="!store.filteredProperties.length" class="empty-state"><div>⌕</div><h3>No listings found</h3><p>Try another location, size, or agency filter.</p><button class="btn-primary" @click="clearFilters">Clear filters</button></div>
      </section>
            <section id="mortgage" class="mortgage-section">
              <div class="mortgage-intro"><div class="eyebrow"><span></span> PLAN YOUR NEXT MOVE</div><h2>Make the numbers <em>clear.</em></h2><p>Estimate monthly principal and interest from your price, down payment, rate, and term.</p><small>Illustrative estimate only; taxes, insurance, fees, and lender terms are not included.</small></div>
              <div class="mortgage-tool"><div class="mortgage-inputs">
                <label>Property price <span>PHP</span><input v-model.number="mortgage.price" type="number" min="0" step="50000"></label>
                <label>Down payment <span>{{ mortgage.downPaymentPercent }}%</span><input v-model.number="mortgage.downPaymentPercent" type="range" min="0" max="80" step="1"></label>
                <label>Annual interest rate <span>%</span><input v-model.number="mortgage.annualRate" type="number" min="0" max="30" step="0.1"></label>
                <label>Loan term <span>years</span><input v-model.number="mortgage.termYears" type="number" min="1" max="40" step="1"></label>
              </div><div class="mortgage-result"><span>Estimated monthly payment</span><strong>{{ money(mortgagePayment) }}</strong><dl><div><dt>Loan amount</dt><dd>{{ money(mortgageLoan) }}</dd></div><div><dt>Estimated interest</dt><dd>{{ money(mortgageInterest) }}</dd></div></dl></div></div>
            </section>


      <section id="about" class="about-section"><div class="about-image"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85" alt="Warm modern home interior"></div><div class="about-copy"><div class="eyebrow"><span></span> A MORE PERSONAL PROPERTY JOURNEY</div><h2>Good spaces.<br><em>Better beginnings.</em></h2><p>Finding a property is more than a transaction. Our goal is to make exploring your options feel clear, considered, and personal — from the first search to your first visit.</p><div class="about-points"><div><b>01</b><span><strong>Curated listings</strong><small>Explore property details in one place.</small></span></div><div><b>02</b><span><strong>People-first service</strong><small>Connect with an agent about a property.</small></span></div><div><b>03</b><span><strong>Clear information</strong><small>Compare type, size, price, and location.</small></span></div></div></div></section>

      <section id="agents" class="section agents-section">
        <div class="section-heading"><div><div class="eyebrow"><span></span> THE PEOPLE BEHIND THE PROPERTY</div><h2>Find an <em>agent.</em></h2><p>Search professionals across the listing network.</p></div></div>
        <label class="agent-search" for="agent-search">Search by agent, agency, or license<input id="agent-search" v-model="agentQuery" type="search" placeholder="Name, agency, PRC license…"></label>
        <div v-if="filteredProfessionals.length" class="agent-grid"><article v-for="profile in filteredProfessionals" :key="profile.id" class="agent-card"><img :src="`/images/agent${profile.id}.jpg`" :alt="profile.user?.name || 'Property professional'"><div><h3>{{ profile.user?.name }}</h3><p>{{ profile.agency_name }} · {{ profile.verification_status }}</p><small>LICENSE {{ profile.license_number }}</small><a v-if="profile.user?.email" class="agent-email" :href="`mailto:${profile.user.email}`">Email agent ↗</a></div></article></div>
        <p v-else class="agent-empty">No agents match that search.</p>
      </section>

      <section class="contact-banner"><div><div class="eyebrow light"><span></span> READY WHEN YOU ARE</div><h2>Your next chapter<br>starts with a <em>conversation.</em></h2></div><a href="#properties" class="btn-light" @click.prevent="showListView">Find your property ↗</a></section>
    </main>

    <footer class="footer"><a class="brand footer-brand" href="#"><span class="brand-mark">KH</span><span class="brand-name">KayaHomes<small>REAL ESTATE</small></span></a><p>Find a place where life happens.</p><div>© 2026 KayaHomes Real Estate · Frontend demo</div></footer>

    <div v-if="accountDialogOpen" class="modal-backdrop" @click.self="accountDialogOpen = false">
      <section class="inquiry-modal account-modal" role="dialog" aria-modal="true" aria-labelledby="account-title">
        <button class="modal-close" aria-label="Close account dialog" @click="accountDialogOpen = false">×</button>
        <div class="eyebrow"><span></span> KAYAHOMES ACCOUNT</div>
        <h2 id="account-title">{{ accountMode === 'login' ? 'Welcome back.' : 'Create an account.' }}</h2>
        <div class="account-tabs" role="tablist" aria-label="Choose login or registration">
          <button type="button" role="tab" :aria-selected="accountMode === 'login'" :class="{ active: accountMode === 'login' }" @click="accountMode = 'login'; accountStatus = ''">Log in</button>
          <button type="button" role="tab" :aria-selected="accountMode === 'register'" :class="{ active: accountMode === 'register' }" @click="accountMode = 'register'; accountStatus = ''">Register</button>
        </div>
        <form @submit.prevent="submitAccount">
          <template v-if="accountMode === 'register'">
            <label for="account-name">Full name</label>
            <input id="account-name" v-model="accountForm.name" required autocomplete="name" placeholder="Your full name">
          </template>
          <label for="account-email">Email address</label>
          <input id="account-email" v-model="accountForm.email" required type="email" autocomplete="email" placeholder="you@example.com">
          <label for="account-password">Password</label>
          <input id="account-password" v-model="accountForm.password" required type="password" minlength="8" :autocomplete="accountMode === 'login' ? 'current-password' : 'new-password'" placeholder="At least 8 characters">
          <template v-if="accountMode === 'register'">
            <label for="account-confirm-password">Confirm password</label>
            <input id="account-confirm-password" v-model="accountForm.confirmPassword" required type="password" minlength="8" autocomplete="new-password" placeholder="Enter your password again">
          </template>
          <p v-if="accountStatus" class="account-status" :class="{ error: accountStatusKind === 'error' }" role="status">{{ accountStatus }}</p>
          <button class="btn-primary full-btn" type="submit">{{ accountMode === 'login' ? 'Log in' : 'Create account' }} <span>↗</span></button>
        </form>
        <small class="account-note">Demo interface only. No credentials are stored or verified.</small>
      </section>
    </div>

    <div v-if="selected" class="modal-backdrop" @click.self="selected = null" @keydown.esc="selected = null">
      <section class="property-modal" role="dialog" aria-modal="true" :aria-label="selected.title">
        <button class="modal-close" aria-label="Close property details" @click="selected = null">×</button>
        <img class="modal-image" :src="imageFor(selected)" :alt="selected.title">
        <div class="modal-content"><span class="type-badge inline-badge">{{ selected.listing_type === 'sale' ? 'FOR SALE' : 'FOR RENT' }}</span><div class="property-price modal-price">{{ money(selected.price) }}<small v-if="selected.listing_type === 'rent'"> / month</small></div><h2>{{ selected.title }}</h2><p class="property-location">⌖ {{ locationFor(selected) }}</p><div class="property-meta modal-meta"><span v-if="selected.bedrooms">{{ selected.bedrooms }} bedrooms</span><span v-if="selected.bathrooms">{{ selected.bathrooms }} bathrooms</span><span v-if="selected.floor_area">{{ selected.floor_area }} m² floor area</span><span v-if="selected.lot_area">{{ selected.lot_area }} m² lot area</span></div><p class="modal-description">{{ selected.description }}</p><h3>Location and coordinates</h3><div class="feature-list"><span>{{ locationFor(selected) }}</span><span v-if="selected.latitude !== null && selected.longitude !== null">{{ selected.latitude }}, {{ selected.longitude }}</span></div><div class="modal-agent"><img :src="agentPhotoFor(selected)" :alt="agentFor(selected)?.name || 'Agent'"><div><strong>{{ agentFor(selected)?.name }}</strong><small>License {{ profileFor(selected)?.license_number }} · {{ profileFor(selected)?.agency_name }}</small></div></div><button class="btn-primary full-btn" @click="openInquiry(selected); selected = null">Send an inquiry ↗</button></div>
      </section>
    </div>

    <div v-if="sellDialogOpen" class="modal-backdrop" @click.self="sellDialogOpen = false">
            <section class="inquiry-modal sell-modal" role="dialog" aria-modal="true" aria-label="List your property">
              <button class="modal-close" aria-label="Close property listing request" @click="sellDialogOpen = false">×</button>
              <div class="eyebrow"><span></span> SELL WITH THE NETWORK</div><h2>List your <em>property.</em></h2>
              <p class="form-intro">Share the basics and a local professional can follow up. This demo keeps the request in this browser only.</p>
              <form v-if="!sellSubmitted" @submit.prevent="submitSellRequest">
                <label for="seller-name">Full name *</label><input id="seller-name" v-model="sellForm.name" required autocomplete="name">
                <label for="seller-email">Email *</label><input id="seller-email" v-model="sellForm.email" required type="email" autocomplete="email">
                <label for="seller-phone">Contact number *</label><input id="seller-phone" v-model="sellForm.phone" required type="tel" autocomplete="tel">
                <label for="seller-city">City / municipality *</label><select id="seller-city" v-model="sellForm.city" required><option disabled value="">Choose a location</option><option v-for="city in store.citiesMunicipalities" :key="city.id">{{ city.name }}</option></select>
                <label for="seller-type">Property type</label><select id="seller-type" v-model="sellForm.propertyType"><option value="house">House</option><option value="condo">Condominium</option><option value="apartment">Apartment</option><option value="lot">Lot / Land</option></select>
                <label for="seller-details">Property details</label><textarea id="seller-details" v-model="sellForm.details" rows="3" placeholder="Approximate size, asking price, and anything an agent should know"></textarea>
                <button class="btn-primary full-btn" type="submit">Request listing support ↗</button>
              </form>
              <p v-else class="form-success" role="status">Request recorded for this demo. No listing has been published or sent to an agent.</p>
            </section>
        </div>

        <div v-if="inquiryProperty" class="modal-backdrop" @click.self="inquiryProperty = null">
      <section class="inquiry-modal" role="dialog" aria-modal="true" aria-label="Property inquiry form">
        <button class="modal-close" aria-label="Close inquiry form" @click="inquiryProperty = null">×</button>
        <div class="eyebrow"><span></span> LET'S TALK PROPERTY</div><h2>Make an <em>inquiry.</em></h2><p class="form-intro">About: {{ inquiryProperty.title }}</p>
        <form @submit.prevent="submitInquiry" novalidate>
          <label for="name">Full name *</label><input id="name" v-model="form.name" autocomplete="name" required placeholder="Your full name">
          <label for="email">Email address *</label><input id="email" v-model="form.email" autocomplete="email" type="email" required placeholder="you@example.com">
          <label for="phone">Contact number</label><input id="phone" v-model="form.phone" autocomplete="tel" type="tel" placeholder="+63 9XX XXX XXXX">
          <label for="message">Message *</label><textarea id="message" v-model="form.message" required rows="4" placeholder="Tell us what you'd like to know"></textarea>
          <p v-if="error" class="form-error" role="alert">{{ error }}</p><p v-if="success" class="form-success" role="status">{{ success }}</p>
          <button class="btn-primary full-btn" type="submit">Submit inquiry ↗</button>
          <small class="privacy-note">Demo only: this form stores inquiries in temporary frontend state and does not send email or save to a database.</small>
        </form>
      </section>
    </div>

    <button v-if="store.favorites.length" class="favorites-float" :class="{ 'is-active': store.onlyFavorites }" :title="store.onlyFavorites ? 'Show all listings' : 'Show saved listings'" @click="toggleFavoritesView">♥ {{ store.favorites.length }} saved</button>
  </div>
</template>
