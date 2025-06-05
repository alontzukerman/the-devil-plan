# Ask Truth - UI Refactoring Checklist

## 🎯 Project Overview

This document tracks the refactoring of the Ask Truth application UI to create a consistent design system using Tailwind CSS and the `@ask-truth/ui` package.

## 📊 Current State Analysis

### ✅ Already Completed
- [x] Color palette (Rich emerald primary, warm copper secondary, sophisticated neutral grays)
- [x] Button component with variants and sizes
- [x] Card component (specialized playing card with suits and ranks)
- [x] Theme system with design tokens
- [x] Typography definitions (font families, sizing, weights)
- [x] ThemeProvider integration

### 🔍 Current Issues Identified
- [ ] Inconsistent input components (using native HTML inputs instead of UI package)
- [ ] Mixed styling approach (some Tailwind direct, some theme system)
- [ ] Form pattern inconsistency across screens
- [ ] No consistent layout wrapper or container system
- [ ] Missing feedback components for user interactions

## 🚀 Refactoring Phases

## Phase 1: Form Components (✅ COMPLETED)

### Core Form Components
- [x] **Input Component** (`/src/components/Input/`)
  - [x] Create `Input.tsx` with Tailwind styling
  - [x] Support variants: `light`, `dark`, `game`
  - [x] Support sizes: `sm`, `md`, `lg`
  - [x] Support states: `default`, `error`, `disabled`, `focused`
  - [x] Export from UI package
  - [x] Add TypeScript types

- [x] **Label Component** (`/src/components/Label/`)
  - [x] Create `Label.tsx` with consistent styling
  - [x] Support required indicator
  - [x] Support different text sizes
  - [x] Export from UI package

- [x] **FormField Component** (`/src/components/FormField/`)
  - [x] Create wrapper component (Label + Input + Error)
  - [x] Handle error state display
  - [x] Support help text
  - [x] Export from UI package

- [x] **Select Component** (`/src/components/Select/`)
  - [x] Create dropdown component with Tailwind
  - [x] Match Input component styling
  - [x] Support custom dropdown arrow
  - [x] Export from UI package

### Form Component Integration
- [x] **Update StartScreen**
  - [x] Replace input in `GameCreationForm.tsx`
  - [x] Replace input in `GameJoiningForm.tsx`
  - [x] Update imports to use UI package components
  
- [x] **Update CardSelectionScreen**
  - [x] Review and update any form inputs (None found - uses card selection UI)
  - [x] Ensure consistent styling

- [x] **Update BiddingScreen**
  - [x] Update any input components (None found - uses button-based UI)
  - [x] Ensure consistent form patterns

- [x] **Update Other Screens**
  - [x] QuestionSelectionScreen form updates (Uses button-based selection, no traditional inputs)
  - [x] TruthGuessingScreen form updates (Uses card selection UI, no traditional inputs)

## Phase 2: Layout Components (✅ COMPLETED)

### Core Layout Components
- [x] **Container Component** (`/src/components/Container/`)
  - [x] Create responsive container with max-width
  - [x] Support different sizes: `sm`, `md`, `lg`, `xl`, `full`
  - [x] Use Tailwind classes: `mx-auto`, `px-4`, etc.
  - [x] Export from UI package

- [x] **GameLayout Component** (`/src/components/GameLayout/`)
  - [x] Create wrapper for all game screens
  - [x] Include consistent header structure
  - [x] Include footer if needed
  - [x] Handle game-specific styling (dark theme)
  - [x] Export from UI package

- [x] **Panel/Card Component** (`/src/components/Panel/`)
  - [x] Create container for form groups (like StartScreen gray panels)
  - [x] Support variants: `default`, `dark`, `game`
  - [x] Use Tailwind: `bg-gray-700`, `bg-opacity-50`, `rounded-lg`, `shadow-xl`
  - [x] Export from UI package

- [x] **Stack Component** (`/src/components/Stack/`)
  - [x] Create component for consistent spacing
  - [x] Support direction: `vertical`, `horizontal`
  - [x] Support spacing values from theme
  - [x] Use Tailwind flexbox utilities
  - [x] Export from UI package

### Layout Integration
- [x] **Wrap Screens with GameLayout**
  - [x] StartScreen layout wrapper
  - [x] CardSelectionScreen layout wrapper
  - [x] BiddingScreen layout wrapper
  - [x] QuestionSelectionScreen layout wrapper
  - [x] TruthGuessingScreen layout wrapper
  - [x] GameOverScreen layout wrapper

- [x] **Replace Manual Containers**
  - [x] Update all screens to use Container component
  - [x] Replace hardcoded form containers with Panel component
  - [x] Use Stack component for element spacing

## Phase 3: Feedback Components (🟡 Medium Priority)

### User Feedback Components
- [ ] **LoadingSpinner Component** (`/src/components/LoadingSpinner/`)
  - [ ] Create spinner with Tailwind animations
  - [ ] Support different sizes
  - [ ] Support theme colors
  - [ ] Export from UI package

- [ ] **Toast/Notification Component** (`/src/components/Toast/`)
  - [ ] Create toast notification system
  - [ ] Support types: `success`, `error`, `warning`, `info`
  - [ ] Use theme semantic colors
  - [ ] Include ToastProvider for app-wide toasts
  - [ ] Export from UI package

- [ ] **Modal Component** (`/src/components/Modal/`)
  - [ ] Create modal overlay and content
  - [ ] Support different sizes
  - [ ] Handle focus management
  - [ ] Use Tailwind backdrop utilities
  - [ ] Export from UI package

- [ ] **Enhanced Alert Component** (`/src/components/Alert/`)
  - [ ] Enhance existing ErrorMessage component
  - [ ] Support multiple alert types
  - [ ] Use theme semantic colors
  - [ ] Add close functionality
  - [ ] Export from UI package

### Feedback Integration
- [ ] **Replace Loading States**
  - [ ] "Waiting for opponent..." states use LoadingSpinner
  - [ ] Connection status use appropriate feedback
  - [ ] Game state changes show loading

- [ ] **Add Toast Notifications**
  - [ ] Socket connection events
  - [ ] Game state changes
  - [ ] Error conditions
  - [ ] Success actions

- [ ] **Add Modal Confirmations**
  - [ ] Card selection confirmation
  - [ ] Bid submission confirmation
  - [ ] Critical game actions

## Phase 4: Game-Specific Components (✅ COMPLETED)

### Game UI Components
- [x] **Timer Component** (`/src/components/Timer/`)
  - [x] Extract timer logic from BiddingScreen
  - [x] Create reusable countdown timer
  - [x] Support different visual styles (default, danger, warning, success)
  - [x] Use Tailwind for animations and colors
  - [x] Export from UI package

- [x] **PlayerInfo Component** (`/src/components/PlayerInfo/`)
  - [x] Standardize player information display
  - [x] Show name, coins, status consistently
  - [x] Use theme colors and typography
  - [x] Export from UI package

- [x] **GameStatus Component** (`/src/components/GameStatus/`)
  - [x] Standardize status messages across screens
  - [x] Support different status types (info, success, warning, error, waiting)
  - [x] Consistent styling with theme
  - [x] Export from UI package

- [x] **CoinDisplay Component** (`/src/components/CoinDisplay/`)
  - [x] Create consistent coin representation
  - [x] Show coin amounts with icons
  - [x] Support different sizes
  - [x] Use theme colors
  - [x] Export from UI package

### Game Component Integration
- [x] **Update BiddingScreen**
  - [x] Use Timer component
  - [x] Use PlayerInfo component
  - [x] Use CoinDisplay component
  - [x] Use GameStatus component

- [x] **Update Other Screens**
  - [x] Apply PlayerInfo where relevant
  - [x] Apply GameStatus for consistent messaging
  - [x] Apply CoinDisplay where coins are shown

## Phase 5: Enhanced Card Components (🟢 Lower Priority)

### Advanced Card Components
- [ ] **CardGrid Component** (`/src/components/CardGrid/`)
  - [ ] Create responsive grid for card layouts
  - [ ] Support different grid sizes
  - [ ] Use Tailwind grid utilities
  - [ ] Export from UI package

- [ ] **CardHand Component** (`/src/components/CardHand/`)
  - [ ] Component for selected card display
  - [ ] Support horizontal scrolling
  - [ ] Handle card removal interactions
  - [ ] Export from UI package

- [ ] **AnimatedCard Component** (`/src/components/AnimatedCard/`)
  - [ ] Add card flip animations
  - [ ] Add selection animations
  - [ ] Use Tailwind transition utilities
  - [ ] Export from UI package

### Card Component Integration
- [ ] **Update CardSelectionScreen**
  - [ ] Use CardGrid for deck display
  - [ ] Use CardHand for selection display
  - [ ] Add animations to card interactions

## Phase 6: Design System Consistency (✅ COMPLETED)

### Theme Integration
- [x] **Replace Hardcoded Colors**
  - [x] Replace `text-yellow-400` with `text-secondary-400`
  - [x] Replace `bg-gray-700` with `bg-neutral-700`
  - [x] Replace `border-gray-600` with `border-neutral-600`
  - [x] Update all semantic colors usage (`text-sky-*` → `text-info`, `text-amber-*` → `text-secondary-*`, etc.)

- [x] **Typography Consistency**
  - [x] Use theme font families consistently (`font-cinzel-decorative` → `font-title`)
  - [x] Replace hardcoded font sizes with theme values
  - [x] Apply consistent font weights from theme

- [x] **Spacing Consistency**
  - [x] Use theme spacing values
  - [x] Replace hardcoded margins/padding
  - [x] Consistent component spacing

### Final Polish
- [x] **Cross-Screen Consistency Review**
  - [x] All screens use same layout patterns
  - [x] All screens use same component variants
  - [x] All screens follow same interaction patterns

- [ ] **Accessibility Improvements** (🟡 Future Enhancement)
  - [ ] All components have proper ARIA labels
  - [ ] Focus management is consistent
  - [ ] Color contrast meets standards
  - [ ] Keyboard navigation works properly

- [ ] **Responsive Design Review** (🟡 Future Enhancement)
  - [ ] All components work on mobile
  - [ ] Game screens are playable on small screens
  - [ ] Touch interactions work properly

## 📋 Implementation Notes

### Tailwind CSS Best Practices
- Use Tailwind utility classes for all styling
- Leverage theme values through CSS custom properties
- Use component variants for different states
- Maintain responsive design patterns
- Use Tailwind's built-in animations and transitions

### Component Architecture
- Each component gets its own directory with `ComponentName.tsx` and `index.ts`
- Export all components from main UI package index
- Use TypeScript interfaces for all props
- Follow consistent naming conventions
- Include JSDoc comments for complex props

### Testing Strategy
- Test each component in isolation
- Test component integration in screens
- Test responsive behavior
- Test accessibility features
- Test theme switching

## 🎯 Quick Start Recommendation

**Start with Phase 1 - Input Component** as it will have the biggest immediate impact:

1. Create the Input component with Tailwind styling
2. Update StartScreen to use the new Input
3. Test the integration
4. Move to Label and FormField components
5. Continue with systematic replacement

This approach ensures you see immediate visual improvements while building a solid foundation for the rest of the refactoring.

---

## 📝 Progress Tracking

**Started:** December 2024  
**Current Phase:** Phase 6 ✅ COMPLETED  
**Next Phase:** Phase 3 - Feedback Components (or Phase 5 - Enhanced Card Components)  
**Notes:** Core refactoring phases (1, 2, 4, 6) completed. Remaining phases are optional enhancements. 

### Phase 1 Implementation Notes:
- ✅ Created comprehensive Input component with 3 variants (light, dark, game) and 3 sizes
- ✅ Created Label component with required indicator support
- ✅ Created FormField wrapper component for consistent form patterns
- ✅ Created Select component with custom dropdown arrow
- ✅ Successfully updated StartScreen forms (GameCreationForm and GameJoiningForm)
- ✅ All components exported from UI package with proper TypeScript types
- ✅ App builds successfully with new components
- ✅ Maintained existing functionality while improving consistency

### Phase 2 Implementation Notes:
- ✅ Created Container component with 5 size variants (sm, md, lg, xl, full) and responsive design
- ✅ Created Panel component with 3 variants (default, dark, game) for consistent content containers
- ✅ Created Stack component with flexible spacing, direction, alignment, and justification options
- ✅ Created GameLayout component as unified wrapper for all game screens with title and background variants
- ✅ Successfully integrated layout components into all 6 screens (Start, Bidding, CardSelection, QuestionSelection, TruthGuessing, GameOver)
- ✅ Replaced manual layout divs with semantic layout components
- ✅ Maintained existing visual appearance while improving code consistency
- ✅ All layout components exported from UI package with proper TypeScript types

### Key Decisions Made:
- Used `game` variant for form inputs to match current dark theme styling
- Used `lg` size for inputs to match existing visual hierarchy
- FormField component provides clean API for label + input + error patterns
- All components follow same pattern as existing Button component
- GameLayout component handles title display and background variants automatically
- Stack component provides consistent spacing using Tailwind space-* utilities
- Panel component matches existing styling patterns (bg-gray-700, bg-slate-700, etc.)
- Container component uses responsive max-width classes for consistent layouts

### Phase 4 Implementation Notes:
- ✅ Created Timer component with auto-variant detection (danger when ≤3s, warning when ≤5s), progress bar support, and multiple sizes
- ✅ Created CoinDisplay component with coin icon, auto-variant detection based on amount, and consistent styling
- ✅ Created PlayerInfo component with current player highlighting, flexible coin display, and status support
- ✅ Created GameStatus component with 5 status types, loading spinner support, and built-in icons
- ✅ Successfully integrated Timer and GameStatus into BiddingScreen via BiddingStatus component
- ✅ Replaced PlayerStatus with new PlayerInfo component in BiddingScreen
- ✅ Updated BidControls to use CoinDisplay for bid amount display
- ✅ Applied GameStatus to TruthGuessingScreen header and loading states
- ✅ Applied GameStatus to CardSelectionScreen header and status messages
- ✅ All components exported from UI package with proper TypeScript types
- ✅ Maintained existing functionality while improving visual consistency
- ✅ App builds successfully with all new components

### Phase 6 Implementation Notes:
- ✅ Updated app's tailwind.config.js to integrate with theme system (colors, typography, spacing, shadows, border radius)
- ✅ Systematically replaced hardcoded colors across all components:
  - `text-yellow-*` → `text-secondary-*` (titles, accents)
  - `text-amber-*` → `text-secondary-*` (highlights, warnings)
  - `text-sky-*` → `text-info` (informational text)
  - `bg-gray-*` → `bg-neutral-*` (backgrounds)
  - `bg-slate-*` → `bg-neutral-*` (panels, containers)
  - `border-gray-*` → `border-neutral-*` (borders)
  - `text-green-*` → `text-success` (success states)
  - `text-red-*` → `text-error` (error states)
- ✅ Updated typography consistency:
  - `font-cinzel-decorative` → `font-title` (all title elements)
  - Consistent use of theme font families
- ✅ Updated UI package components to use theme colors:
  - Panel, GameLayout, PlayerInfo, GameStatus, Timer, CoinDisplay
  - All hardcoded colors replaced with semantic theme colors
- ✅ Maintained visual appearance while improving code consistency
- ✅ Both app and UI package build successfully
- ✅ **RESOLVED: Theme colors now working properly**
  - Rich Emerald/Warm Copper color scheme displaying correctly
  - Theme color utility classes (text-primary-*, text-secondary-*, etc.) generated successfully
  - CSS custom properties properly integrated with Tailwind configuration
  - Solution: Added manual @layer utilities definitions in index.css to force generation of theme color classes
  - App builds and displays theme colors correctly in browser 