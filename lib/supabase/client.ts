import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/supabase/types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return [];
          
          const cookies = document.cookie
            .split(';')
            .map((cookie) => {
              const [name, ...rest] = cookie.split('=');
              const value = rest.join('=');
              return {
                name: decodeURIComponent(name.trim()),
                value: decodeURIComponent(value.trim()),
              };
            });
          return cookies;
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return;

          cookiesToSet.forEach(({ name, value, options }) => {
            const cookie = `${name}=${value}`;
            if (options?.maxAge !== undefined) {
              const maxAge = typeof options.maxAge === 'number' 
                ? options.maxAge 
                : new Date(options.maxAge).getTime() - Date.now();
              document.cookie = `${cookie};max-age=${maxAge};path=/`;
            } else {
              document.cookie = `${cookie};path=/`;
            }
          });
        },
      },
    }
  );
}

