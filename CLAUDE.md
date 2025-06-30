# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Developer Behavior
- Act as a senior developer
- Keep responses short and concise
- Do exactly what is requested, nothing more
- Always document changes in swiftedu.md

## Development Commands

- **Development server**: `npm run dev` (uses Next.js with Turbopack)
- **Build**: `npm build`
- **Production server**: `npm start`
- **Lint**: `npm run lint`

## Project Architecture

### Core Structure
This is a Next.js 15 TypeScript application for SwiftEDU LMS (Learning Management System) with a premium brown/gold design theme.

**Key architectural patterns:**
- Next.js App Router (src/app/)
- Client-side state management with React hooks
- Component-based architecture with separation of concerns
- Single Page Application behavior within dashboard using section switching

### Main Application Flow
1. **Login Page** (`src/app/page.tsx`): Premium login form with brown/gold design
2. **Dashboard** (`src/app/dashboard/page.tsx`): Main LMS interface with modular sections
3. **Dashboard Layout** (`src/components/DashboardLayout.tsx`): Sidebar navigation with section switching

### Component Architecture
- **DashboardLayout**: Central layout component managing sidebar, header, and content area
- **Content Components**: Modular components for each dashboard section (Users, Courses, Assessments, Reports, Settings)
- **LoginForm**: Standalone login component with premium styling

### Design System
- **Color Palette**: Brown (#654321, #8B4513) + Gold (#FFD700, #B8860B)
- **Typography**: Poppins (primary) + Montserrat (headings)
- **Styling**: Tailwind CSS with custom gradients and glassmorphism effects
- **Responsive**: Mobile-first approach with sidebar collapse on mobile

### Navigation System
The dashboard uses a single-page application pattern where:
- Navigation is handled by `activeSection` state in DashboardLayout
- Each section renders its own component (DashboardContent, UsersContent, etc.)
- No routing between dashboard sections - uses component switching instead

### State Management
- Local component state with React hooks
- No external state management library
- Section switching managed in DashboardLayout component

## Development Notes

### Premium Features Implemented
- Advanced glassmorphism effects with backdrop-blur
- Gradient backgrounds and golden accents
- Responsive sidebar with mobile overlay
- Professional typography with Google Fonts
- Micro-interactions and hover states
- Optimized text contrast for better accessibility

### Text Contrast System
- **Primary text**: #4A2C17 with font-semibold for headings and important content
- **Secondary text**: #654321 with font-medium for labels and descriptions
- **Improved accessibility**: Better contrast ratios while maintaining design aesthetic
- **Consistent hierarchy**: Progressive color darkness with appropriate font weights

### Component Organization
Each dashboard section has its own component file:
- `DashboardContent.tsx` - Analytics and metrics
- `UsersContent.tsx` - User management
- `CoursesContent.tsx` - Course management  
- `AssessmentsContent.tsx` - Quiz/assessment system
- `ReportsContent.tsx` - Analytics and reporting
- `SettingsContent.tsx` - System configuration

### Technical Implementation
- Uses `'use client'` directive for interactive components
- Implements responsive design with Tailwind's responsive utilities
- Glassmorphism achieved with `backdrop-blur-xl` and semi-transparent backgrounds
- Custom CSS classes for patterns and textures (pattern-dots)