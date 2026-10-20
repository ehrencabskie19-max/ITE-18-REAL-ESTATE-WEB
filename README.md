# KayaHomes Real Estate

A responsive Nuxt 3 + Vue 3 frontend concept based on the supplied HomeQuest ERD.

## Included screens and interactions
- Homepage and property collection
- Search by keyword, city, address, and property type
- Filter by sale/rent and property category
- Property detail modal with features, image, and assigned agent
- Favorites toggle using Pinia state
- Inquiry form with required-field, email, and phone validation
- Agent section
- Responsive desktop/tablet/mobile styling
- Demo data reflecting `users`, `agents`, `properties`, `property_images`, `property_features`, `favorites`, and `inquiries`

## Run locally
1. Install Node.js LTS.
2. Extract this folder.
3. Open a terminal in the project folder.
4. Run `npm install`
5. Run `npm run dev`
6. Open the local URL shown in the terminal (usually `http://localhost:3000`).

## Notes
- This is a frontend prototype. Property listings, agents, favorites, and inquiries use sample/in-memory data.
- Inquiries are not sent to an email address and are not persisted in a database.
- Images and Google Fonts load from external URLs and need an internet connection.
- No real authentication is implemented. `users`/`agents` are represented by demo data.
- Connect a backend API and database for persistent data before production use.
- All sample property names, prices, agents, and license numbers are illustrative placeholders.
