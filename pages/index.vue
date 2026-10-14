<script setup lang="ts">
import { useRealEstateStore, type Property } from '~/stores/realEstate'
const store = useRealEstateStore()
const selected = ref<Property | null>(null)
const inquiryProperty = ref<Property | null>(null)
const form = reactive({ name: '', email: '', phone: '', message: '' })
const error = ref('')
const success = ref('')
const money = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n)
const agentFor = (id: number) => store.agents.find(a => a.id === id)
function openInquiry(p: Property) {
  inquiryProperty.value = p
  form.name = ''; form.email = ''; form.phone = ''; form.message = `I'm interested in ${p.title}.`
  error.value = ''; success.value = ''
}
function submitInquiry() {
  error.value = ''; success.value = ''
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
  store.submitInquiry({ property_id: inquiryProperty.value!.id, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), message: form.message.trim() })
  success.value = 'Your inquiry has been recorded in this demo.'
  form.name = ''; form.email = ''; form.phone = ''; form.message = ''
}
const clearFilters = () => { store.search = ''; store.typeFilter = 'all'; store.listingFilter = 'all'; store.maxPrice = 10000000 }
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#" @click.prevent="selected = null">
        <span class="brand-mark">C<span>&</span>S</span>
        <span class="brand-name">CABODBOD <i>&</i> SETARIOS<small>REAL ESTATE</small></span>
      </a>
      <nav class="nav-links">
        <a href="#properties">Properties</a><a href="#about">About us</a><a href="#agents">Our agents</a>
      </nav>
      <a class="nav-cta" href="#properties">Explore homes <span>↗</span></a>
    </header>

    <main>
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow"><span></span> FIND A PLACE TO CALL HOME</div>
          <h1>Find a place<br>where life <em>happens.</em></h1>
          <p>Thoughtfully selected homes, apartments, and lots to help you take the next step with confidence.</p>
          <div class="hero-actions"><a class="btn-primary" href="#properties">Explore properties <span>↗</span></a><a class="text-link" href="#about">Discover our story</a></div>
          <div class="hero-stats"><div><strong>{{ store.properties.length }}+</strong><span>Sample listings</span></div><div><strong>{{ store.agentCount }}</strong><span>Property agents</span></div><div><strong>4.9/5</strong><span>Client experience*</span></div></div>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=90" alt="Modern house with landscaped garden">
          <div class="image-label"><span class="label-dot"></span><div><strong>Spaces for your next chapter</strong><small>Homes · Condos · Land</small></div></div>
          <div class="vertical-note">PROPERTY COLLECTION — 2026</div>
        </div>
      </section>

      <section class="search-panel" aria-label="Search properties">
        <div class="search-field search-keyword"><label for="search">LOCATION OR KEYWORD</label><div class="input-with-icon"><span>⌕</span><input id="search" v-model="store.search" placeholder="City, neighborhood, property..."></div></div>
        <div class="search-field"><label for="listing">I'M LOOKING TO</label><select id="listing" v-model="store.listingFilter"><option value="all">Buy or rent</option><option value="sale">Buy a property</option><option value="rent">Rent a property</option></select></div>
        <div class="search-field"><label for="type">PROPERTY TYPE</label><select id="type" v-model="store.typeFilter"><option value="all">All types</option><option value="house">House</option><option value="condo">Condominium</option><option value="apartment">Apartment</option><option value="lot">Lot / Land</option></select></div>
        <button class="search-button" @click="document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })">Search homes <span>↗</span></button>
      </section>

      <section id="properties" class="section properties-section">
        <div class="section-heading"><div><div class="eyebrow"><span></span> THE COLLECTION</div><h2>Find your <em>space.</em></h2><p>Explore places selected for the way you want to live.</p></div><button class="clear-btn" @click="clearFilters">Reset filters ↺</button></div>
        <div class="listing-toolbar"><span><strong>{{ store.filteredProperties.length }}</strong> properties available</span><span class="toolbar-note">Prices shown in Philippine pesos (PHP)</span></div>
        <div v-if="store.filteredProperties.length" class="property-grid">
          <article v-for="p in store.filteredProperties" :key="p.id" class="property-card">
            <div class="card-image" @click="selected = p">
              <img :src="p.image" :alt="p.title">
              <span class="type-badge">{{ p.listing_type === 'sale' ? 'FOR SALE' : 'FOR RENT' }}</span>
              <button class="favorite-btn" :class="{ active: store.favorites.includes(p.id) }" :aria-label="store.favorites.includes(p.id) ? 'Remove from favorites' : 'Add to favorites'" @click.stop="store.toggleFavorite(p.id)">{{ store.favorites.includes(p.id) ? '♥' : '♡' }}</button>
            </div>
            <div class="card-body">
              <div class="property-price">{{ money(p.price) }}<small v-if="p.listing_type === 'rent'"> / month</small></div>
              <button class="property-title" @click="selected = p">{{ p.title }} <span>↗</span></button>
              <div class="property-location">⌖ {{ p.address }}</div>
              <div class="card-divider"></div>
              <div class="property-meta"><span v-if="p.bedrooms">▱ {{ p.bedrooms }} beds</span><span v-if="p.bathrooms">♧ {{ p.bathrooms }} baths</span><span>↔ {{ p.floor_area || p.lot_area }} m²</span></div>
              <div class="card-bottom"><div class="agent-mini"><img :src="agentFor(p.agent_id)?.photo" alt=""><span>{{ agentFor(p.agent_id)?.name || 'Our agent' }}</span></div><button class="details-btn" @click="selected = p">Details ↗</button></div>
            </div>
          </article>
        </div>
        <div v-else class="empty-state"><div>⌕</div><h3>No properties found</h3><p>Try changing your search or resetting the filters.</p><button class="btn-primary" @click="clearFilters">Clear filters</button></div>
      </section>

      <section id="about" class="about-section"><div class="about-image"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85" alt="Warm modern home interior"></div><div class="about-copy"><div class="eyebrow"><span></span> A MORE PERSONAL PROPERTY JOURNEY</div><h2>Good spaces.<br><em>Better beginnings.</em></h2><p>Finding a property is more than a transaction. Our goal is to make exploring your options feel clear, considered, and personal — from the first search to your first visit.</p><div class="about-points"><div><b>01</b><span><strong>Curated listings</strong><small>Explore property details in one place.</small></span></div><div><b>02</b><span><strong>People-first service</strong><small>Connect with an agent about a property.</small></span></div><div><b>03</b><span><strong>Clear information</strong><small>Compare type, size, price, and location.</small></span></div></div></div></section>

      <section id="agents" class="section agents-section"><div class="section-heading"><div><div class="eyebrow"><span></span> THE PEOPLE BEHIND THE PROPERTY</div><h2>Meet our <em>agents.</em></h2><p>Friendly guidance for your next move.</p></div></div><div class="agent-grid"><article v-for="a in store.agents" :key="a.id" class="agent-card"><img :src="a.photo" :alt="a.name"><div><h3>{{ a.name }}</h3><p>{{ a.bio }}</p><small>LICENSE {{ a.license_no }}</small></div></article></div></section>

      <section class="contact-banner"><div><div class="eyebrow light"><span></span> READY WHEN YOU ARE</div><h2>Your next chapter<br>starts with a <em>conversation.</em></h2></div><a href="#properties" class="btn-light">Find your property ↗</a></section>
    </main>

    <footer class="footer"><a class="brand footer-brand" href="#"><span class="brand-mark">C<span>&</span>S</span><span class="brand-name">CABODBOD <i>&</i> SETARIOS<small>REAL ESTATE</small></span></a><p>Find a place where life happens.</p><div>© 2026 Cabodbod & Setarios · Frontend demo</div></footer>

    <div v-if="selected" class="modal-backdrop" @click.self="selected = null" @keydown.esc="selected = null">
      <section class="property-modal" role="dialog" aria-modal="true" :aria-label="selected.title">
        <button class="modal-close" aria-label="Close property details" @click="selected = null">×</button>
        <img class="modal-image" :src="selected.image" :alt="selected.title">
        <div class="modal-content"><span class="type-badge inline-badge">{{ selected.listing_type === 'sale' ? 'FOR SALE' : 'FOR RENT' }}</span><div class="property-price modal-price">{{ money(selected.price) }}<small v-if="selected.listing_type === 'rent'"> / month</small></div><h2>{{ selected.title }}</h2><p class="property-location">⌖ {{ selected.address }}</p><div class="property-meta modal-meta"><span v-if="selected.bedrooms">{{ selected.bedrooms }} bedrooms</span><span v-if="selected.bathrooms">{{ selected.bathrooms }} bathrooms</span><span>{{ selected.floor_area || selected.lot_area }} m²</span></div><p class="modal-description">{{ selected.description }}</p><h3>Property features</h3><div class="feature-list"><span v-for="f in selected.features" :key="f">✓ {{ f }}</span></div><div class="modal-agent"><img :src="agentFor(selected.agent_id)?.photo" alt=""><div><strong>{{ agentFor(selected.agent_id)?.name }}</strong><small>Property agent · {{ agentFor(selected.agent_id)?.license_no }}</small></div></div><button class="btn-primary full-btn" @click="openInquiry(selected); selected = null">Send an inquiry ↗</button></div>
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

    <button v-if="store.favorites.length" class="favorites-float" @click="store.search = ''; store.typeFilter = 'all'; store.listingFilter = 'all'; document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })">♥ {{ store.favorites.length }} saved</button>
  </div>
</template>
