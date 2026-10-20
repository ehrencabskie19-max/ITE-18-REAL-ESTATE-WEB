<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRealEstateStore, type Property } from '../stores/realEstate'

type PortalRole = 'consumer' | 'agent' | 'admin'

const store = useRealEstateStore()
const roles: PortalRole[] = ['consumer', 'agent', 'admin']
const activeRole = ref<PortalRole>('consumer')
const buyer = computed(() => store.users.find(user => user.role === 'user'))
const agentProfile = computed(() => store.professionalProfiles[0])
const agent = computed(() => store.users.find(user => user.id === agentProfile.value?.user_id))
const savedProperties = computed(() => store.properties.filter(property => store.isFavorite(property.id)))
const buyerInquiries = computed(() => store.inquiries.filter(inquiry => inquiry.user_id === buyer.value?.id))
const agentProperties = computed(() => store.properties.filter(property => property.professional_id === agentProfile.value?.id))
const agentInquiries = computed(() => store.inquiries.filter(inquiry => inquiry.professional_id === agentProfile.value?.id))
const activeAccounts = computed(() => store.users.filter(user => user.account_status === 'active').length)
const pendingProfiles = computed(() => store.professionalProfiles.filter(profile => profile.verification_status === 'pending').length)
const openInquiries = computed(() => store.inquiries.filter(inquiry => inquiry.inquiry_status !== 'closed').length)

const dashboardTitle = computed(() => ({
  consumer: 'Your home search',
  agent: 'Your agent workspace',
  admin: 'Network overview'
}[activeRole.value]))

const dashboardDescription = computed(() => ({
  consumer: 'Keep your shortlist and property conversations in one place.',
  agent: 'A focused view of your listings and client inquiries.',
  admin: 'Review the people, listings, and activity across KayaHomes.'
}[activeRole.value]))

const money = (amount: number) => new Intl.NumberFormat('en-PH', {
  style: 'currency', currency: 'PHP', maximumFractionDigits: 0
}).format(amount)

const imageFor = (propertyId: number) => store.propertyImages.find(image => image.property_id === propertyId)?.image_url || ''

function locationFor(property: Property) {
  const barangay = store.barangays.find(item => item.id === property.barangay_id)
  const city = store.citiesMunicipalities.find(item => item.id === barangay?.city_municipality_id)
  return [barangay?.name, city?.name].filter(Boolean).join(', ')
}

function propertyForInquiry(propertyId: number) {
  return store.properties.find(property => property.id === propertyId)
}

function toggleAccountStatus(userId: number) {
  const user = store.users.find(item => item.id === userId)
  if (user) user.account_status = user.account_status === 'active' ? 'suspended' : 'active'
}

function updateListingStatus(property: Property, event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (value === 'available' || value === 'sold' || value === 'rented') {
    property.listing_status = value
  }
}
</script>

<template>
  <div class="portal-app">
    <header class="portal-topbar">
      <a class="portal-brand" href="/" aria-label="KayaHomes home">
        <span class="portal-brand-mark">KH</span>
        <span>KayaHomes<small>REAL ESTATE</small></span>
      </a>
      <a class="portal-market-link" href="/">Browse marketplace <span>↗</span></a>
    </header>

    <main class="portal-main">
      <section class="portal-intro">
        <div>
          <div class="portal-eyebrow"><span></span> KAYAHOMES WORKSPACE</div>
          <h1>{{ dashboardTitle }}</h1>
          <p>{{ dashboardDescription }}</p>
        </div>
        <div class="portal-role-switch" role="group" aria-label="Choose a dashboard role">
          <button v-for="role in roles" :key="role" type="button" :aria-pressed="activeRole === role" :class="{ active: activeRole === role }" @click="activeRole = role">
            {{ role }}
          </button>
        </div>
      </section>

      <div class="portal-demo-note"><span></span> SAMPLE {{ activeRole.toUpperCase() }} VIEW</div>

      <template v-if="activeRole === 'consumer'">
        <section class="portal-metrics" aria-label="Consumer summary">
          <div><span>Saved properties</span><strong>{{ savedProperties.length }}</strong><small>Your current shortlist</small></div>
          <div><span>Open inquiries</span><strong>{{ buyerInquiries.filter(inquiry => inquiry.inquiry_status !== 'closed').length }}</strong><small>Property conversations</small></div>
          <div><span>Available homes</span><strong>{{ store.availableProperties.length }}</strong><small>Across the marketplace</small></div>
        </section>

        <div class="portal-content-grid">
          <section class="portal-section">
            <div class="portal-section-heading"><div><span class="portal-eyebrow">YOUR SHORTLIST</span><h2>Saved properties</h2></div><a href="/#properties">Browse all <span>↗</span></a></div>
            <div v-if="savedProperties.length" class="portal-property-list">
              <article v-for="property in savedProperties" :key="property.id" class="portal-property-row">
                <img :src="imageFor(property.id)" :alt="property.title">
                <div class="portal-property-copy"><strong>{{ property.title }}</strong><span>{{ locationFor(property) }}</span><b>{{ money(property.price) }}</b></div>
                <button class="portal-text-button" :aria-label="`Remove ${property.title} from saved properties`" @click="store.toggleFavorite(property.id)">Remove</button>
              </article>
            </div>
            <div v-else class="portal-empty"><h3>Your shortlist is ready</h3><p>Save homes from the marketplace and they will appear here.</p><a class="portal-primary-link" href="/#properties">Explore properties <span>↗</span></a></div>
          </section>

          <section class="portal-section">
            <div class="portal-section-heading"><div><span class="portal-eyebrow">PROPERTY ACTIVITY</span><h2>My inquiries</h2></div></div>
            <div v-if="buyerInquiries.length" class="portal-activity-list">
              <article v-for="inquiry in buyerInquiries" :key="inquiry.id" class="portal-activity-row">
                <span class="portal-status-dot" :class="`status-${inquiry.inquiry_status}`"></span>
                <div><strong>{{ propertyForInquiry(inquiry.property_id)?.title || 'Property inquiry' }}</strong><span>{{ inquiry.message }}</span></div>
                <small>{{ inquiry.inquiry_status }}</small>
              </article>
            </div>
            <div v-else class="portal-empty portal-empty-compact"><h3>No inquiries yet</h3><p>Contact an agent from any property listing to start a conversation.</p></div>
          </section>
        </div>

        <section class="portal-section portal-recommendations">
          <div class="portal-section-heading"><div><span class="portal-eyebrow">A PLACE TO START</span><h2>Recently listed</h2></div><a href="/#properties">View marketplace <span>↗</span></a></div>
          <div class="portal-recommendation-grid">
            <article v-for="property in store.availableProperties.slice(0, 3)" :key="property.id" class="portal-recommendation">
              <a href="/#properties"><img :src="imageFor(property.id)" :alt="property.title"></a>
              <div><span>{{ property.listing_type === 'sale' ? 'FOR SALE' : 'FOR RENT' }}</span><button :aria-pressed="store.isFavorite(property.id)" :aria-label="store.isFavorite(property.id) ? 'Remove from saved properties' : 'Save property'" @click="store.toggleFavorite(property.id)">{{ store.isFavorite(property.id) ? '♥' : '♡' }}</button></div>
              <h3>{{ property.title }}</h3><p>{{ locationFor(property) }}</p><strong>{{ money(property.price) }}</strong>
            </article>
          </div>
        </section>
      </template>

      <template v-else-if="activeRole === 'agent'">
        <section class="portal-profile-strip">
          <img src="/images/agent1.jpg" :alt="agent?.name || 'Agent profile'">
          <div><span>AGENT PROFILE</span><strong>{{ agent?.name || 'Demo agent' }}</strong><small>{{ agentProfile?.agency_name }} · License {{ agentProfile?.license_number }}</small></div>
          <span class="portal-verified">{{ agentProfile?.verification_status }}</span>
        </section>
        <section class="portal-metrics" aria-label="Agent summary">
          <div><span>My listings</span><strong>{{ agentProperties.length }}</strong><small>Assigned to your profile</small></div>
          <div><span>Active listings</span><strong>{{ agentProperties.filter(property => property.listing_status === 'available').length }}</strong><small>Visible in marketplace</small></div>
          <div><span>New inquiries</span><strong>{{ agentInquiries.filter(inquiry => inquiry.inquiry_status === 'new').length }}</strong><small>Waiting for follow-up</small></div>
        </section>
        <div class="portal-content-grid">
          <section class="portal-section">
            <div class="portal-section-heading"><div><span class="portal-eyebrow">YOUR INVENTORY</span><h2>My listings</h2></div><a href="/#properties">Marketplace <span>↗</span></a></div>
            <div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Property</th><th>Price</th><th>Status</th></tr></thead><tbody>
              <tr v-for="property in agentProperties" :key="property.id"><td><strong>{{ property.title }}</strong><small>{{ locationFor(property) }}</small></td><td>{{ money(property.price) }}</td><td><span class="portal-table-status" :class="{ available: property.listing_status === 'available' }">{{ property.listing_status }}</span></td></tr>
            </tbody></table></div>
          </section>
          <section class="portal-section">
            <div class="portal-section-heading"><div><span class="portal-eyebrow">CLIENT FOLLOW-UP</span><h2>Recent inquiries</h2></div></div>
            <div v-if="agentInquiries.length" class="portal-activity-list">
              <article v-for="inquiry in agentInquiries" :key="inquiry.id" class="portal-activity-row"><span class="portal-status-dot" :class="`status-${inquiry.inquiry_status}`"></span><div><strong>{{ store.users.find(user => user.id === inquiry.user_id)?.name || 'Client' }}</strong><span>{{ propertyForInquiry(inquiry.property_id)?.title }} · {{ inquiry.message }}</span></div><small>{{ inquiry.inquiry_status }}</small></article>
            </div>
            <div v-else class="portal-empty portal-empty-compact"><h3>No new inquiries</h3><p>Client messages about your listings will appear here.</p></div>
          </section>
        </div>
      </template>

      <template v-else>
        <section class="portal-metrics" aria-label="Administrator summary">
          <div><span>Total users</span><strong>{{ store.users.length }}</strong><small>{{ activeAccounts }} active accounts</small></div>
          <div><span>Properties</span><strong>{{ store.properties.length }}</strong><small>{{ store.availableProperties.length }} currently available</small></div>
          <div><span>License reviews</span><strong>{{ pendingProfiles }}</strong><small>Profiles awaiting review</small></div>
          <div><span>Open inquiries</span><strong>{{ openInquiries }}</strong><small>Across the network</small></div>
        </section>
        <div class="portal-content-grid portal-admin-grid">
          <section class="portal-section">
            <div class="portal-section-heading"><div><span class="portal-eyebrow">ACCESS OVERSIGHT</span><h2>User accounts</h2></div></div>
            <div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Account</th><th>Role</th><th>Status</th><th></th></tr></thead><tbody>
              <tr v-for="user in store.users" :key="user.id"><td><strong>{{ user.name }}</strong><small>{{ user.email }}</small></td><td>{{ user.role }}</td><td><span class="portal-table-status" :class="{ available: user.account_status === 'active' }">{{ user.account_status }}</span></td><td><button class="portal-text-button" @click="toggleAccountStatus(user.id)">{{ user.account_status === 'active' ? 'Suspend' : 'Activate' }}</button></td></tr>
            </tbody></table></div>
          </section>
          <section class="portal-section">
            <div class="portal-section-heading"><div><span class="portal-eyebrow">LISTING OVERSIGHT</span><h2>Property inventory</h2></div></div>
            <div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Property</th><th>Agent</th><th>Status</th></tr></thead><tbody>
              <tr v-for="property in store.properties" :key="property.id"><td><strong>{{ property.title }}</strong><small>{{ money(property.price) }}</small></td><td>{{ store.professionalProfiles.find(profile => profile.id === property.professional_id)?.agency_name || '—' }}</td><td><select class="portal-status-select" :value="property.listing_status" :aria-label="`Status for ${property.title}`" @change="updateListingStatus(property, $event)"><option value="available">Available</option><option value="sold">Sold</option><option value="rented">Rented</option></select></td></tr>
            </tbody></table></div>
          </section>
        </div>
      </template>

      <footer class="portal-footer"><span>DEMO WORKSPACE</span><p>Role views use sample data. Account access and changes are not connected to a backend.</p></footer>
    </main>
  </div>
</template>

<style scoped>
.portal-app{min-height:100vh;background:#fff;color:var(--ink);font-family:var(--font-simple)}
.portal-topbar{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;height:72px;padding:0 6%;border-bottom:1px solid var(--line);background:#fff}
.portal-brand{display:flex;align-items:center;gap:11px;color:var(--ink);font-size:13px;font-weight:700}
.portal-brand small{display:block;margin-top:3px;color:var(--muted);font-size:9px;font-weight:500;letter-spacing:2px}
.portal-brand-mark{display:grid;place-items:center;width:38px;height:38px;border:1px solid var(--green);color:var(--green);font-family:var(--font-simple);font-weight:700}
.portal-market-link{padding:10px 13px;color:var(--green);font-size:12px;font-weight:700}
.portal-market-link span,.portal-section-heading>a span{margin-left:7px;color:var(--gold)}
.portal-main{max-width:1280px;margin:0 auto;padding:48px 6% 64px}
.portal-intro{display:flex;align-items:end;justify-content:space-between;gap:24px;padding-bottom:27px}
.portal-eyebrow{display:block;color:var(--green);font-size:9px;font-weight:700;letter-spacing:1.5px}
.portal-eyebrow>span{display:inline-block;width:20px;height:1px;margin:0 8px 3px 0;background:var(--gold)}
.portal-intro h1{margin:11px 0 7px;font-family:var(--font-simple);font-size:38px;font-weight:700;line-height:1.12}
.portal-intro p{margin:0;color:#4e5752;font-size:13px;line-height:1.6}
.portal-role-switch{display:flex;gap:3px;padding:4px;border:1px solid var(--line);background:var(--cream)}
.portal-role-switch button{min-width:88px;border:0;background:transparent;color:#4e5752;padding:10px 13px;font-size:11px;font-weight:700;text-transform:capitalize}
.portal-role-switch button.active{background:var(--green);color:#fff}
.portal-demo-note{display:flex;align-items:center;gap:8px;margin:0 0 23px;padding:10px 12px;border:1px solid var(--line);color:#4e5752;font-size:9px;font-weight:700;letter-spacing:1px}
.portal-demo-note span{width:7px;height:7px;border-radius:50%;background:var(--gold)}
.portal-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:32px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.portal-metrics>div{display:grid;gap:7px;min-width:0;padding:19px 22px;border-right:1px solid var(--line)}
.portal-metrics>div:first-child{padding-left:0}
.portal-metrics>div:last-child{border-right:0}
.portal-metrics span,.portal-metrics small{color:#4e5752;font-size:11px}
.portal-metrics strong{font-family:var(--font-simple);font-size:27px;font-weight:700;line-height:1.1;color:var(--ink)}
.portal-metrics small{font-size:10px}
.portal-content-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr);gap:34px}
.portal-section{min-width:0}
.portal-section-heading{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:17px}
.portal-section-heading h2{margin:6px 0 0;font-size:18px;font-weight:700;color:var(--ink)}
.portal-section-heading>a{color:var(--green);font-size:10px;font-weight:700;white-space:nowrap}
.portal-property-list,.portal-activity-list{border-top:1px solid var(--line)}
.portal-property-row{display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid var(--line)}
.portal-property-row>img{width:82px;height:64px;flex:none;object-fit:cover}
.portal-property-copy{display:grid;gap:4px;min-width:0;flex:1}
.portal-property-copy strong,.portal-activity-row strong{overflow:hidden;color:var(--ink);font-size:12px;text-overflow:ellipsis;white-space:nowrap}
.portal-property-copy span,.portal-activity-row span{color:#4e5752;font-size:10px;line-height:1.5}
.portal-property-copy b{color:var(--green);font-size:11px}
.portal-text-button{border:0;background:transparent;color:var(--green);padding:8px 2px;font-size:10px;font-weight:700;white-space:nowrap}
.portal-text-button:hover,.portal-section-heading>a:hover{color:#153c31;text-decoration:underline}
.portal-empty{padding:24px 0;border-top:1px solid var(--line)}
.portal-empty h3{margin:0 0 7px;font-size:13px;color:var(--ink)}
.portal-empty p{margin:0 0 15px;color:#4e5752;font-size:11px;line-height:1.6}
.portal-empty-compact{padding-top:20px}
.portal-primary-link{display:inline-flex;align-items:center;gap:12px;background:var(--green);color:#fff;padding:11px 14px;font-size:10px;font-weight:700}
.portal-activity-row{display:grid;grid-template-columns:8px minmax(0,1fr) auto;align-items:start;gap:10px;padding:14px 0;border-bottom:1px solid var(--line)}
.portal-activity-row>div{display:grid;gap:4px;min-width:0}
.portal-activity-row>small{color:#4e5752;font-size:9px;text-transform:capitalize}
.portal-status-dot{width:7px;height:7px;margin-top:4px;border-radius:50%;background:var(--gold)}
.portal-status-dot.status-closed{background:#8b918d}
.portal-recommendations{margin-top:39px;padding-top:27px;border-top:1px solid var(--line)}
.portal-recommendation-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.portal-recommendation{min-width:0}
.portal-recommendation>a{display:block;height:155px;overflow:hidden;background:var(--cream)}
.portal-recommendation img{width:100%;height:100%;object-fit:cover;transition:transform .25s}
.portal-recommendation>a:hover img{transform:scale(1.03)}
.portal-recommendation>div{display:flex;align-items:center;justify-content:space-between;margin-top:10px}
.portal-recommendation>div>span{color:var(--green);font-size:8px;font-weight:700;letter-spacing:1px}
.portal-recommendation>div>button{border:0;background:transparent;color:var(--green);font-size:18px}
.portal-recommendation h3{margin:5px 0;color:var(--ink);font-size:12px}
.portal-recommendation p{margin:0 0 8px;color:#4e5752;font-size:10px}
.portal-recommendation>strong{color:var(--green);font-size:11px}
.portal-profile-strip{display:flex;align-items:center;gap:14px;margin-bottom:25px;padding:15px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.portal-profile-strip>img{width:52px;height:52px;border-radius:50%;object-fit:cover}
.portal-profile-strip>div{display:grid;gap:4px;flex:1}
.portal-profile-strip>div>span{color:var(--green);font-size:8px;font-weight:700;letter-spacing:1px}
.portal-profile-strip>div>strong{font-size:12px}
.portal-profile-strip>div>small{color:#4e5752;font-size:10px}
.portal-verified,.portal-table-status{display:inline-flex;align-items:center;width:max-content;padding:5px 8px;background:#edf5ef;color:#246c36;font-size:9px;font-weight:700;text-transform:capitalize}
.portal-table-wrap{max-width:100%;overflow:auto;border-top:1px solid var(--line)}
.portal-table{width:100%;border-collapse:collapse;text-align:left;white-space:nowrap}
.portal-table th{padding:10px 12px;color:#4e5752;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
.portal-table td{padding:12px;border-top:1px solid var(--line);color:#4e5752;font-size:10px}
.portal-table td:first-child{min-width:145px}
.portal-table td strong,.portal-table td small{display:block}
.portal-table td strong{color:var(--ink);font-size:11px}
.portal-table td small{margin-top:4px;color:#4e5752;font-size:9px}
.portal-table-status:not(.available){background:#f4f1e9;color:#6d5b37}
.portal-status-select{border:1px solid var(--line);background:#fff;color:var(--ink);padding:7px;font:inherit;font-size:10px}
.portal-admin-grid{grid-template-columns:1fr}
.portal-footer{display:flex;align-items:center;gap:14px;margin-top:45px;padding-top:17px;border-top:1px solid var(--line)}
.portal-footer>span{color:var(--green);font-size:8px;font-weight:700;letter-spacing:1px;white-space:nowrap}
.portal-footer p{margin:0;color:#4e5752;font-size:10px;line-height:1.5}
@media(max-width:760px){.portal-main{padding:35px 5% 48px}.portal-intro{align-items:stretch;flex-direction:column}.portal-role-switch{width:100%}.portal-role-switch button{flex:1;min-width:0}.portal-content-grid{grid-template-columns:1fr;gap:28px}.portal-metrics{grid-template-columns:1fr 1fr}.portal-metrics>div{padding:15px;border-bottom:1px solid var(--line)}.portal-metrics>div:first-child{padding-left:15px}.portal-metrics>div:nth-child(2){border-right:0}.portal-metrics>div:last-child{grid-column:1/-1;border-bottom:0}.portal-recommendation-grid{grid-template-columns:1fr 1fr}.portal-recommendation>a{height:135px}.portal-topbar{padding:0 5%}}
@media(max-width:460px){.portal-intro h1{font-size:32px}.portal-topbar{height:64px}.portal-brand{font-size:11px}.portal-brand-mark{width:34px;height:34px}.portal-market-link{padding:8px 0;font-size:10px}.portal-recommendation-grid{grid-template-columns:1fr}.portal-recommendation>a{height:185px}.portal-property-row{gap:9px}.portal-property-row>img{width:66px;height:58px}.portal-property-copy strong{font-size:11px}.portal-text-button{font-size:9px}.portal-footer{align-items:flex-start;flex-direction:column}}
</style>