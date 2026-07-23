// ======================================================
// Free Report Workflow
// ======================================================

import { Pipeline } from "../core/pipelines";

export const FreeReportPipeline: Pipeline = {
    id: "free-report",
    name: "Free AI Report",
    description:
        "Lead generation report.",

    collectors: [
        {
            id: "website-collector",
        },

        {

            id: "technology-detector",

        },

        {

            id: "google-business",

            required: false,

        },

        {

            id: "social-scanner",

            required: false,

        },

    ],

    analysts: [

        {

            id: "website-analysis",

        },

        {

            id: "seo-analysis",

        },

        {

            id: "ux-analysis",

        },

        {

            id: "marketing-analysis",

        },

        {

            id: "conversion-analysis",

        },

        {

            id: "report-writer",

        },

    ],

    actions: [

        {

            id: "save-report",

        },

        {

            id: "send-email",

        },

    ],

};