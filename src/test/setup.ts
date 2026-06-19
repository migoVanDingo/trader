import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Without Vitest globals, RTL's auto-cleanup isn't registered — do it explicitly
// so each test starts with a fresh DOM.
afterEach(() => cleanup());
