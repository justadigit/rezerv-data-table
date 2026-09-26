import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { App } from "@/app/App";
import { Button } from "@/components/ui/button";

describe("foundation routes", () => {
  it("renders the timetable placeholder and navigates to the temporary table preview", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Class timetable route" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Class timetable implementation is pending/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Reuse demo route" }));
    expect(
      screen.getByRole("heading", { name: "Reusable DataTable" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("shows accessible foundation primitives and responds to keyboard activation", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Feature content is pending" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Error state preview");
    expect(
      screen.getByRole("status", { name: "Skeleton preview" }),
    ).toBeInTheDocument();

    const button = screen.getByRole("button", {
      name: "Show foundation status",
    });
    button.focus();
    await user.keyboard("{Enter}");
    expect(
      screen.getByText("Foundation preview is working."),
    ).toBeInTheDocument();
  });
});

describe("Button", () => {
  it("is a native button that invokes its handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Continue</Button>);

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toHaveAttribute("type", "button");
    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
