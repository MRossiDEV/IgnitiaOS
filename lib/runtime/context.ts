import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { aiconn } from "@/ai/aiconn";

export interface RuntimeUser {
  id: string;

  name?: string;

  email?: string;

  role?: string;
}

export interface RuntimeClient {
  id: string;

  companyName: string;

  website?: string;

  industry?: string;

  city?: string;

  country?: string;
}

export interface RuntimeLogger {
  info(message: string, data?: any): void;

  warn(message: string, data?: any): void;

  error(message: string, data?: any): void;

  debug(message: string, data?: any): void;
}

export interface RuntimeContextOptions {
  user: RuntimeUser;

  client?: RuntimeClient;

  apiKeys?: Record<string, string>;

  variables?: Record<string, any>;

  logger?: RuntimeLogger;
}

export class RuntimeContext {
  readonly user: RuntimeUser;

  readonly client?: RuntimeClient;

  readonly apiKeys: Record<string, string>;

  readonly variables: Record<string, any>;

  readonly logger: RuntimeLogger;

  readonly aiconn: typeof aiconn;

  readonly supabase: SupabaseClient;

  constructor(options: RuntimeContextOptions) {
    this.user = options.user;

    this.client = options.client;

    this.apiKeys = options.apiKeys ?? {};

    this.variables = options.variables ?? {};

    this.logger =
      options.logger ??
      {
        info: console.log,

        warn: console.warn,

        error: console.error,

        debug: console.log,
      };

    this.aiconn = aiconn;

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );
  }

  //----------------------------
  // Variables
  //----------------------------

  get(key: string) {
    return this.variables[key];
  }

  set(key: string, value: any) {
    this.variables[key] = value;
  }

  has(key: string) {
    return key in this.variables;
  }

  //----------------------------
  // API Keys
  //----------------------------

  getApiKey(provider: string) {
    return (
      this.apiKeys[provider] ??
      process.env[provider]
    );
  }

  //----------------------------
  // Logger
  //----------------------------

  log(message: string, data?: any) {
    this.logger.info(message, data);
  }

  debug(message: string, data?: any) {
    this.logger.debug(message, data);
  }

  warn(message: string, data?: any) {
    this.logger.warn(message, data);
  }

  error(message: string, data?: any) {
    this.logger.error(message, data);
  }

  //----------------------------
  // Serialization
  //----------------------------

  export() {
    return {
      user: this.user,

      client: this.client,

      variables: this.variables,
    };
  }
}