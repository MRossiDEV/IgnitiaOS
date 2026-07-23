// ======================================================
// IgnitiaOS
// AI Logger
// ======================================================

export type LogLevel =
    | "info"
    | "success"
    | "warning"
    | "error";

export interface LogEntry {

    timestamp: string;

    level: LogLevel;

    source: string;

    message: string;

    data?: unknown;

}

class AILogger {

    private logs: LogEntry[] = [];

    private enabled =
        process.env.NODE_ENV !== "production";

    private write(
        level: LogLevel,
        source: string,
        message: string,
        data?: unknown
    ) {

        const entry: LogEntry = {

            timestamp:
                new Date().toISOString(),

            level,

            source,

            message,

            data,

        };

        this.logs.push(entry);

        if (!this.enabled)
            return;

        const prefix =
            `[${entry.timestamp}] [${level.toUpperCase()}] [${source}]`;

        switch (level) {

            case "error":
                console.error(prefix, message, data ?? "");
                break;

            case "warning":
                console.warn(prefix, message, data ?? "");
                break;

            default:
                console.log(prefix, message, data ?? "");

        }

    }

    info(
        source: string,
        message: string,
        data?: unknown
    ) {

        this.write(
            "info",
            source,
            message,
            data
        );

    }

    success(
        source: string,
        message: string,
        data?: unknown
    ) {

        this.write(
            "success",
            source,
            message,
            data
        );

    }

    warning(
        source: string,
        message: string,
        data?: unknown
    ) {

        this.write(
            "warning",
            source,
            message,
            data
        );

    }

    error(
        source: string,
        message: string,
        data?: unknown
    ) {

        this.write(
            "error",
            source,
            message,
            data
        );

    }

    getLogs() {

        return [...this.logs];

    }

    clear() {

        this.logs = [];

    }

}

export const aiLogger =
    new AILogger();