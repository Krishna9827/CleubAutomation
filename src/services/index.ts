// Central export for all services
export { supabase } from './supabase/config'
export { projectService as supabaseProjectService } from './supabase/projectService'
export { userService as supabaseUserService } from './supabase/userService'
export { adminService } from './supabase/adminService'
export { db, auth } from './firebase/config'
export { setAdminClaim, getCurrentUserUID } from './firebase/adminSetup'
