/**
 * Page Flow Documentation
 * 
 * Flow for Creating a New Project:
 * 1. "/" (PremiumLanding) - Welcome page
 * 2. "/intake" (Index) - Collect client & project information
 * 3. "/room-selection" (RoomSelection) - Select/add rooms for the property
 * 4. "/requirements" (RequirementSheet2) - Add appliances & requirements per room
 * 5. "/final-review" (FinalReview) - Review and finalize project
 * 6. "/planner" (Planner) - Main project editor
 * 
 * Additional Routes:
 * - "/history" (History) - View saved projects
 * - "/admin" (AdminSettings) - Manage admin settings
 * - "/admin-login" (AdminLogin) - Admin authentication
 * - "/admin/testimonials" (AdminTestimonials) - Manage testimonials
 * - "/premium" (PremiumLanding) - Premium features landing page
 * 
 * Data Flow:
 * - Index page creates project in Firebase and stores projectId
 * - Each subsequent page updates project data in Firebase
 * - localStorage keeps backup for offline capability
 */

export const PAGE_FLOW = {
  WELCOME: '/',
  INTAKE: '/intake',
  ROOM_SELECTION: '/room-selection',
  REQUIREMENTS: '/requirements',
  FINAL_REVIEW: '/final-review',
  PLANNER: '/planner',
  HISTORY: '/history',
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin-login',
  ADMIN_TESTIMONIALS: '/admin/testimonials',
  PREMIUM: '/premium',
} as const;

export const getNextPage = (currentPage: string): string => {
  switch (currentPage) {
    case PAGE_FLOW.WELCOME:
      return PAGE_FLOW.INTAKE;
    case PAGE_FLOW.INTAKE:
      return PAGE_FLOW.ROOM_SELECTION;
    case PAGE_FLOW.ROOM_SELECTION:
      return PAGE_FLOW.REQUIREMENTS;
    case PAGE_FLOW.REQUIREMENTS:
      return PAGE_FLOW.FINAL_REVIEW;
    case PAGE_FLOW.FINAL_REVIEW:
      return PAGE_FLOW.PLANNER;
    default:
      return PAGE_FLOW.PLANNER;
  }
};
