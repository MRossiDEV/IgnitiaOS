export const DEFAULT_COMMAND_TIMEOUT_MS = 120_000
export const DEFAULT_BUILD_COMMAND = "npm"
export const DEFAULT_BUILD_ARGS = ["run", "build"]
export const DEFAULT_TEST_COMMAND = "npm"
export const DEFAULT_TEST_ARGS = ["run", "lint"]

export const SUPPORTED_DEPLOYMENT_TARGETS = ["vercel", "netlify", "docker", "manual"] as const
