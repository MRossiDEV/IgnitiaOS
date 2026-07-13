import { toast } from "sonner";

export const notify = {
  success: (message: string) => toast.success(message),

  error: (message: string) => toast.error(message),

  info: (message: string) => toast.info(message),

  warning: (message: string) => toast.warning(message),

  loading: (message: string) => toast.loading(message),
};



// toast.success("Lead assigned");

// toast.success("Website audit completed");

// toast.success("Proposal generated");

// toast.success("Email campaign sent");

// toast.success("Report published");

// toast.error("Unable to connect to Anthropic");

// toast.error("Supabase request failed");

// toast.warning("Credits running low");

// toast.info("New lead received");

// toast.loading("Analyzing website...");

// toast.loading("Scanning Google Business Profile...");

// toast.loading("Generating AI recommendations...");