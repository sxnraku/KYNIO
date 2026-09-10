// Ambient type declarations for Supabase Edge Functions (Deno runtime) in VS Code / IDE

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): Record<string, string>;
  };

  export interface ServeOptions {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onListen?: (params: { hostname: string; port: number }) => void;
    onError?: (error: unknown) => Response | Promise<Response>;
  }

  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
  ): void;
  export function serve(
    options: ServeOptions,
    handler: (request: Request) => Response | Promise<Response>,
  ): void;
}

declare module 'jsr:@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}
