# Design Guidelines: Premium Makeup Tutorial Landing Page

## Design Approach

**Selected Framework**: Reference-based approach inspired by luxury beauty brands (Charlotte Tilbury, Dior Beauty, Pat McGrath Labs)

**Rationale**: This landing page requires emotional engagement and visual elegance to communicate premium 1:1 makeup education services. Drawing from high-end beauty brand aesthetics while maintaining clarity for service offerings and conversion.

**Core Principles**:
- Elegant, spacious layouts with generous whitespace
- Sophisticated typography hierarchy
- Trust-building through social proof (2800+ students)
- Clear service differentiation
- Luxurious yet approachable feel

---

## Typography

**Font Stack**: 
- Primary: Cormorant Garamond (elegant serif for headlines)
- Secondary: Inter or Noto Sans KR (clean sans-serif for body, Korean support)
- System fallback: -apple-system, BlinkMacSystemFont

**Type Scale**:
- Hero headline: text-5xl md:text-6xl lg:text-7xl font-light (tracking-tight)
- Section titles: text-4xl md:text-5xl font-light
- Subheadings: text-2xl md:text-3xl font-normal
- Service titles: text-xl font-medium
- Body text: text-base leading-relaxed
- Testimonial quotes: text-lg md:text-xl font-light italic
- Meta info: text-sm uppercase tracking-wide

**Korean Text**: Line-height 1.7, ensure elegant pairing with serif headlines

---

## Layout System

**Spacing Primitives**: Tailwind units of 4, 8, 12, 16, 20, 24
- Section padding: py-20 md:py-32 for spacious feel
- Component padding: p-8 to p-12
- Content spacing: space-y-8 to space-y-12
- Generous margins: my-16 to my-24 between major sections

**Container Structure**:
- Max-width: max-w-7xl mx-auto
- Content sections: max-w-5xl for text-heavy areas
- Full-width backgrounds with inner constraints

---

## Component Library

### Hero Section (Full viewport impact, 85vh min-height)
- Large elegant headline: "당신만을 위한 메이크업 레슨" (centered)
- Subheadline: "2800명 이상의 수강생이 선택한 1:1 맞춤 교육"
- Two CTA buttons: Primary (상담 신청하기), Secondary (수강후기 보기)
- Subtle scroll indicator at bottom
- Background: Hero image with overlay for text readability
- Buttons with backdrop-blur-md on image backgrounds

### Trust Bar (Immediately below hero, py-12)
- Three columns (lg:flex justify-center gap-16)
- Stats with large numbers: "2800+" students, "강남역 3분", "1:1 맞춤"
- Elegant dividers between stats
- Centered layout with icon + number + label pattern

### Services Section (Multi-column grid, py-24)
- Section header: "프로그램 안내" (centered, mb-16)
- Five service cards in 1/2/3 column grid (mobile/tablet/desktop)
- Cards: hover-lift effect (hover:transform hover:-translate-y-2)
- Each card: Icon/illustration, service name, brief description, duration/price indicator
- Services: 셀프메이크업, 취미반, 자격증반, 대학입시반, 전문가반

### Feature Highlights (Two-column alternating layout, py-24)
- Three feature blocks, alternating image-left/image-right
- Features: 1:1 맞춤 커리큘럼, 강남역 접근성, 전문 강사진
- Each block: Large image (50% width), content area (50% width)
- Content: Headline, 2-3 paragraphs, supporting details
- Generous spacing between blocks (mb-20)

### Testimonials Section (Grid layout, py-24)
- Section header: "수강생 후기" (centered, mb-16)
- Three-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Testimonial cards with:
  - Large opening quote mark
  - Student quote (text-lg italic)
  - Student name, course taken, date (text-sm)
  - Optional student photo/avatar
- Cards with subtle shadow and hover states

### Location Section (Split layout, py-24)
- Two-column: Map embed (50%), Location details (50%)
- Details: Address, transit directions, nearby landmarks
- "길찾기" button linking to map services
- Landmark: "강남역 3분 거리" prominently featured

### Final CTA Section (Full-width, centered, py-32)
- Compelling headline: "나만의 메이크업 스타일을 찾아보세요"
- Supporting text about free consultation
- Large primary CTA button
- Secondary text: "카카오톡 상담 가능" with icon

### Footer (Multi-column, py-16)
- Four columns on desktop (grid-cols-1 md:grid-cols-4)
- Column 1: Brand/logo, tagline
- Column 2: Quick links (프로그램, 후기, 위치)
- Column 3: Contact (phone, email, Kakao)
- Column 4: Social media icons, business hours
- Bottom bar: Copyright, privacy policy

---

## Images

**Hero Image Required**: Full-width, high-quality image of elegant makeup application or sophisticated beauty shot. Should convey luxury and professionalism. Image should extend full viewport height with subtle parallax effect.

**Feature Section Images**: Three lifestyle images showing:
1. One-on-one instruction in elegant studio setting
2. Close-up of makeup application/techniques
3. Before/after transformation or student achievement

**Service Card Icons**: Custom illustrations or elegant line icons representing each program type

**Testimonial Photos**: Circular cropped student photos (optional but recommended for trust-building)

**Location Map**: Embedded Google Maps or Naver Map showing Gangnam station proximity

---

## Interactions

**Minimal, Elegant Animations**:
- Fade-in on scroll for sections (duration-500)
- Gentle hover lifts for cards (transform translate-y-2)
- Smooth scroll to anchor links
- Modal fade for detailed service information

**CTA Buttons**: Prominent size (px-8 py-4), clear hierarchy, high contrast

**Responsive Images**: Use srcset for optimal loading, lazy loading for below-fold images

---

## Mobile Optimization

- Hero: Full mobile viewport, stack text elements vertically
- Stats: Vertical stack on mobile (space-y-8)
- Services: Single column cards on mobile, two-column on tablet
- Features: Stack image/text vertically, image-first order
- Testimonials: Horizontal scroll carousel on mobile, grid on desktop
- Footer: Single column stack on mobile
- Sticky mobile CTA bar at bottom (fixed bottom-0) with primary action
- Touch targets: Minimum 48px for all interactive elements