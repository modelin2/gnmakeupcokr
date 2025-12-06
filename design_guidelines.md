# Design Guidelines: Calendar-Based Appointment Management System

## Design Approach

**Selected Framework**: Material Design with productivity app influences (Notion, Linear)

**Rationale**: This appointment management system requires efficiency, information density, and data clarity. Material Design provides excellent calendar patterns and form components while maintaining clean aesthetics suitable for a beauty/makeup service business context.

**Core Principles**:
- Information hierarchy and scanability
- Efficient data entry and editing
- Clear visual categorization
- Professional, clean aesthetics
- Mobile-responsive layouts

---

## Typography

**Font Stack**: 
- Primary: Inter or Noto Sans KR (Korean support essential)
- System fallback: -apple-system, BlinkMacSystemFont, "Segoe UI"

**Type Scale**:
- Page titles: text-3xl font-bold (appointments list, settings)
- Section headers: text-xl font-semibold (calendar month/year, modal headers)
- Calendar dates: text-lg font-medium (active day numbers)
- Appointment titles: text-base font-medium (customer names)
- Body text: text-sm (appointment details, form labels)
- Meta info: text-xs (timestamps, categories)

**Korean Text Optimization**: Ensure adequate line-height (1.6-1.7) for Korean characters

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-4
- Form field spacing: space-y-4

**Grid Structure**:
- Main container: max-w-7xl mx-auto px-4
- Calendar grid: 7-column layout (days of week)
- Appointment list: Single column on mobile, potential 2-column on desktop
- Form layouts: Single column, max-w-2xl for optimal readability

**Responsive Breakpoints**:
- Mobile: Full-width calendar with vertical scrolling
- Tablet (md:): Side-by-side views (calendar + details panel)
- Desktop (lg:): Three-column layout option (sidebar navigation + calendar + details)

---

## Component Library

### Navigation
- **Top Navigation Bar**: Fixed header with app logo/title, view switcher (Month/Week/Day), action buttons
- **Sidebar (desktop)**: Category filters, quick stats, date picker
- **Mobile Navigation**: Bottom navigation bar with key actions

### Calendar Components
- **Month View**: Grid-based calendar with date cells containing appointment dots/indicators
- **Week View**: Horizontal timeline with hourly slots
- **Day View**: Vertical timeline with detailed appointment blocks
- **Date Cells**: Clear typography, hover states, selected state with subtle border/background
- **Appointment Indicators**: Small colored dots or bars (7 category colors)

### Cards & Containers
- **Appointment Cards**: 
  - Rounded corners (rounded-lg)
  - Subtle shadow (shadow-sm)
  - Left border (4px) in category color
  - Compact padding (p-4)
  - Hover state: shadow-md transition
- **Modal/Drawer**: Full-screen on mobile, centered dialog on desktop (max-w-2xl)
- **Form Containers**: Clean backgrounds, generous padding (p-6)

### Forms & Inputs
- **Text Inputs**: 
  - Border style: border rounded-md
  - Focused state: ring-2 with brand color
  - Height: h-10 for standard inputs
  - Korean IME support essential
- **Date/Time Pickers**: Native or custom calendar picker, time dropdown with common slots
- **Select Dropdowns**: Category selector with color preview
- **Textarea**: For appointment details/notes, min-h-24
- **Buttons**:
  - Primary: Solid fill, medium weight, px-6 py-2.5
  - Secondary: Outline style
  - Danger: Red variant for delete actions
  - Icon buttons: Square (h-10 w-10) for compact areas

### Data Display
- **Appointment List Items**:
  - Customer name (font-medium)
  - Time (text-sm, muted)
  - Category badge (small, rounded, colored)
  - Phone number preview (text-xs)
- **Category Badges**: 7 distinct colors (pastel tones for backgrounds, saturated for borders)
  - Category 1: Blue
  - Category 2: Purple
  - Category 3: Pink
  - Category 4: Orange
  - Category 5: Green
  - Category 6: Teal
  - Category 7: Indigo
- **Empty States**: Centered icon + text when no appointments
- **Loading States**: Skeleton screens for calendar cells and lists

### Search & Filters
- **Search Bar**: Prominent placement in header, icon + input field
- **Filter Chips**: Horizontal scrolling row of category filters
- **Date Range Selector**: Compact dropdown or inline picker

### Modals & Overlays
- **Appointment Detail Modal**: 
  - Header with customer name and edit/delete actions
  - Organized sections (contact info, appointment details, notes)
  - Footer with action buttons
- **Import Data Modal**: File upload area, progress indicator, success/error messages
- **Confirmation Dialogs**: Centered, simple yes/no for deletions

---

## Key Screens Layout

### Main Calendar View
- Header: App title, view toggle (Month/Week/Day), Add appointment button, Search
- Body: Calendar grid (month) or timeline (week/day)
- Sidebar (desktop): Category legend, mini date picker, upcoming appointments preview

### Appointment Creation/Edit
- Modal or full-screen on mobile
- Form sections: Customer info, date/time, category, details
- Clear save/cancel actions

### Import Data Screen
- Simple upload zone
- Progress bar during parsing
- Success summary with stats (X appointments imported from year Y to Z)

---

## Interactions

**Minimize Animations**: Use only for essential feedback
- Modal fade-in/out: duration-200
- Hover state transitions: transition-all duration-150
- Loading spinners: Simple rotation animation

**Click Targets**: Minimum 44px touch targets for mobile

**Keyboard Navigation**: Full support for tab navigation, enter to submit, escape to close modals

---

## Images

**No Hero Image**: This is a utility application - no marketing/landing page needed

**Icons**: Heroicons (outline style for UI, solid for emphasis)
- Calendar icon for view switcher
- Clock for time fields
- User for customer info
- Tag for categories
- Search, filter, add, edit, delete, upload icons

**Avatars**: Optional customer avatar placeholders (initials-based, colored by category)

---

## Mobile Optimization

- Stack all layouts vertically on mobile
- Bottom navigation for primary actions (Today, Add, Search)
- Swipe gestures for day/week navigation
- Full-screen modals for forms
- Horizontal scroll for week view timeline
- Touch-friendly tap targets (min 44px)