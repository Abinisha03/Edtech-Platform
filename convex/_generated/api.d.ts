/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityLog from "../activityLog.js";
import type * as ai from "../ai.js";
import type * as appStats from "../appStats.js";
import type * as assignments from "../assignments.js";
import type * as courses from "../courses.js";
import type * as debug from "../debug.js";
import type * as enrollments from "../enrollments.js";
import type * as maintenance from "../maintenance.js";
import type * as materials from "../materials.js";
import type * as modules from "../modules.js";
import type * as mux from "../mux.js";
import type * as progress from "../progress.js";
import type * as reviews from "../reviews.js";
import type * as seedAssignments from "../seedAssignments.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityLog: typeof activityLog;
  ai: typeof ai;
  appStats: typeof appStats;
  assignments: typeof assignments;
  courses: typeof courses;
  debug: typeof debug;
  enrollments: typeof enrollments;
  maintenance: typeof maintenance;
  materials: typeof materials;
  modules: typeof modules;
  mux: typeof mux;
  progress: typeof progress;
  reviews: typeof reviews;
  seedAssignments: typeof seedAssignments;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
