/** @vitest-environment jsdom */
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import { createElement, type ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));

vi.mock("@/features/auth/actions", () => ({
  registerFormAction: async (_prev: unknown, formData: FormData) => ({
    error: "Slaptažodis per trumpas",
    fields: {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      gradeLevel: String(formData.get("gradeLevel") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    },
  }),
}));

import { RegisterForm } from "@/features/auth/components/register-form";

describe("registration keeps typed values after an error", () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    root = null;
    container = null;
  });

  it("restores name, email, grade and passwords", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root?.render(createElement(RegisterForm));
    });

    const firstName = document.getElementById("firstName") as HTMLInputElement;
    const lastName = document.getElementById("lastName") as HTMLInputElement;
    const email = document.getElementById("email") as HTMLInputElement;
    const grade = document.getElementById("gradeLevel") as HTMLSelectElement;
    const password = document.getElementById("password") as HTMLInputElement;
    const confirm = document.getElementById("confirmPassword") as HTMLInputElement;

    firstName.value = "Austėja";
    lastName.value = "Kazlauskaitė";
    email.value = "austeja@mokykla.lt";
    grade.value = "11";
    password.value = "Trumpas1";
    confirm.value = "Trumpas1";

    const form = container.querySelector("form");
    expect(form).toBeTruthy();
    await act(async () => {
      form?.requestSubmit();
    });

    expect((document.getElementById("firstName") as HTMLInputElement).value).toBe("Austėja");
    expect((document.getElementById("lastName") as HTMLInputElement).value).toBe("Kazlauskaitė");
    expect((document.getElementById("email") as HTMLInputElement).value).toBe("austeja@mokykla.lt");
    expect((document.getElementById("gradeLevel") as HTMLSelectElement).value).toBe("11");
    expect((document.getElementById("password") as HTMLInputElement).value).toBe("Trumpas1");
    expect((document.getElementById("confirmPassword") as HTMLInputElement).value).toBe("Trumpas1");
    expect(container.textContent).toContain("Slaptažodis per trumpas");
  });
});
