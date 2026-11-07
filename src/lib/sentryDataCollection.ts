import type * as Sentry from "@sentry/nextjs";

type DataCollection = NonNullable<NonNullable<Parameters<typeof Sentry.init>[0]>["dataCollection"]>;

// Sentry 11 replaced `sendDefaultPii` with `dataCollection`, and its defaults
// collect more than before (request bodies, cookies, headers, local
// variables). FYStay handles guests' personal details and booking data, so
// everything that could carry them is off; stack traces and code context stay.
export const sentryDataCollection: DataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],
  urlQueryParams: false,
  databaseQueryData: false,
  queues: false,
  graphQL: { document: false, variables: false },
  genAI: { inputs: false, outputs: false },
  mcp: { inputs: false, outputs: false },
  stackFrameVariables: false,
};
