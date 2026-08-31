import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { AuthProvider } from "./auth";
import { App } from "./App";

vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ errors: [{ message: "No session" }] }) }));

it("shows the secure login when no refresh session is available", async () => {
  render(<MemoryRouter><AuthProvider><App /></AuthProvider></MemoryRouter>);
  expect(await screen.findByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
});
