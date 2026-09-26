import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { App } from "@/app/App";
import { Button } from "@/components/ui/button";

describe("app routes", () => {
  it("renders the class timetable and navigates to the internal table preview", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Class Timetable" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("link", { name: "Internal table preview" }),
    );
    expect(
      screen.getByRole("heading", { name: "Reusable DataTable" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
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
