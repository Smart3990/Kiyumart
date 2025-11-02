# KiyuMart Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based with E-commerce Excellence

Drawing inspiration from Shopify's clean product management, Jumia's multi-vendor marketplace structure, WhatsApp's chat interface, and modern fashion platforms like ASOS for product presentation. This combines commercial trust with fashion-forward aesthetics.

**Core Principles:**
- Product-first visual hierarchy emphasizing high-quality imagery
- Trust-building through clear information architecture and status indicators
- Mobile-first responsive design with app-like navigation patterns
- Dashboard clarity with data visualization and quick-action affordances

---

## Typography

**Font Stack:** 
- Primary: Inter or SF Pro Display (via Google Fonts CDN)
- Accent/Display: Outfit or Poppins for headers and CTAs

**Hierarchy:**
- Hero Headings: 48px-72px (text-5xl to text-7xl), font-bold
- Section Headings: 32px-40px (text-3xl to text-4xl), font-semibold
- Card Titles: 20px-24px (text-xl to text-2xl), font-semibold
- Body Text: 16px (text-base), font-normal, leading-relaxed
- Small Text/Labels: 14px (text-sm), font-medium
- Micro Text: 12px (text-xs) for timestamps, metadata

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24

**Container Strategy:**
- Max-width: 1440px (max-w-7xl) for main content
- Dashboard cards: p-6 to p-8
- Page sections: py-12 to py-20
- Component spacing: gap-4 to gap-8
- Grid gutters: gap-6

**Grid Patterns:**
- Product grids: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Dashboard metrics: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Feature sections: grid-cols-1 lg:grid-cols-2
- Vendor listings: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

---

## Component Library

### Navigation

**Main Header (Buyer/Public):**
- Sticky top navigation with logo left, search bar center, cart/account icons right
- Height: h-16 to h-20
- Contains: Categories dropdown, currency/language selectors
- Mobile: Hamburger menu with slide-out drawer

**Dashboard Sidebar (Admin/Seller/Rider):**
- Fixed left sidebar, w-64 on desktop, collapsible to w-16 with icons only
- Navigation items with icons (Heroicons), grouped by function
- Active state: Distinct visual treatment with indicator bar
- User profile section at bottom with role badge

### Product Cards

**Standard Product Card:**
- Aspect ratio: 3:4 for product image
- Hover: Slight scale transform (scale-105) with shadow increase
- Contains: Image, title (2 lines max), price (large, bold), discount badge (if applicable), quick-add button
- Heart icon for wishlist (top-right overlay)
- Rating stars with count below price

**Featured Product Card (Larger):**
- Full-width image with gradient overlay at bottom
- Text overlaid on image: Title, price, CTA button with backdrop-blur
- Multiple images in carousel with dot indicators

### Forms & Inputs

**Input Fields:**
- Height: h-12
- Padding: px-4
- Border width: border-2
- Rounded: rounded-lg
- Labels: text-sm, font-medium, mb-2
- Focus state: Prominent outline treatment
- Error state: Red border with error message below (text-sm)

**Buttons:**
- Primary CTA: h-12, px-8, rounded-lg, font-semibold, text-base
- Secondary: Similar sizing with outlined variant
- Icon buttons: w-10 h-10, rounded-full for circular actions
- Loading state: Spinner with disabled appearance
- Buttons on images: backdrop-blur-md background

### Dashboard Components

**Metric Cards:**
- Grid layout with icon, label, large number, percentage change indicator
- Icons in circular backgrounds (w-12 h-12)
- Trend arrows and sparkline charts where applicable
- Padding: p-6

**Data Tables:**
- Zebra striping for rows
- Sticky header on scroll
- Action buttons (icon-only) in last column
- Pagination at bottom
- Search and filter controls above table

**Charts/Analytics:**
- Use Chart.js or Recharts library
- Consistent spacing: mb-8 between chart sections
- Legend positioned top-right or bottom
- Responsive: Stack on mobile

### Chat Interface (WhatsApp-style)

**Chat List:**
- Each contact: Avatar (w-12 h-12, rounded-full), name, last message preview (text-sm, truncated), timestamp, unread badge
- Online status: Small dot indicator on avatar
- Height per item: h-20
- Dividers between conversations

**Chat Window:**
- Fixed header: Contact info, call button, menu
- Message bubbles: max-w-md, rounded-2xl, p-3
- Sender bubbles: Right-aligned
- Receiver bubbles: Left-aligned
- Timestamps: text-xs below bubbles
- Input area: Fixed bottom with attachment button, text input (h-12), send button

### Delivery Tracking

**Map View:**
- Full-width container, min-h-96
- Leaflet.js integration with custom markers
- Route polyline with distinct visual treatment
- Info cards overlaid on map with backdrop-blur
- Real-time position updates

**Order Timeline:**
- Vertical stepper component
- Each step: Icon (w-8 h-8 in circle), title, timestamp
- Active step: Highlighted with animated indicator
- Completed steps: Checkmark icon

### Modals & Overlays

**Modal Structure:**
- Backdrop: Semi-transparent overlay
- Container: max-w-2xl, rounded-xl, p-8
- Header: Title (text-2xl), close button (top-right)
- Footer: Action buttons right-aligned with gap-4
- Scrollable body if content exceeds viewport

### Badges & Status Indicators

**Status Badges:**
- Pill shape: rounded-full, px-3, py-1, text-xs, font-medium
- Order statuses: Pending, Processing, Shipped, Delivered, Cancelled
- Seller badges: "Top Seller", "Fast Delivery", "Verified"
- Positioned: Absolute top-right on cards or inline in lists

### Onboarding & Auth Pages

**Layout:**
- Split screen on desktop: 50% illustration/brand image, 50% form
- Mobile: Full-width form with small brand header
- Form container: max-w-md, centered
- Progress indicator (dots) for multi-step flows
- Social proof elements: Testimonial snippet, user count

---

## Images

**Hero Section (Public Storefront):**
- Full-width hero banner: 600px-800px height on desktop
- High-quality fashion lifestyle photography
- Multiple sliding banners with dot indicators
- Text overlay with backdrop-blur buttons: "Shop Now", "Explore Collections"

**Product Images:**
- Primary: 5 images per product in carousel format
- Thumbnail strip below main image (w-16 h-16 each)
- Video thumbnail with play icon overlay
- Zoom functionality on click/hover (desktop)

**Vendor Store Headers:**
- Cover image: 240px height, full-width
- Vendor logo: Circular, w-24 h-24, positioned overlapping cover (bottom-left)

**Empty States:**
- Illustrative images (e.g., empty cart, no orders)
- Centered with text below, CTA button
- max-w-sm for illustration

**Dashboard Placeholders:**
- User avatars: Initials in colored circles if no photo
- Product placeholders: Light gray with camera icon

**Category Tiles (Homepage):**
- Grid of 6-8 categories
- Each: Square or 16:9 ratio, rounded-xl, with category name overlaid
- Hover: Brightness increase

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 768px - Single column, bottom navigation, simplified header
- Tablet: 768px-1024px - Two columns, collapsible sidebar
- Desktop: > 1024px - Full multi-column layouts, persistent sidebar

**Mobile-Specific:**
- Bottom tab bar navigation for buyers (5 icons max)
- Swipeable product carousels
- Full-screen modals
- Floating action button for primary actions

---

## Accessibility

- All interactive elements: min-height h-11 (44px touch target)
- Form labels always visible, not placeholder-only
- ARIA labels on icon-only buttons
- Keyboard navigation: Focus visible states with outline
- Screen reader text for status changes
- Alt text for all product images