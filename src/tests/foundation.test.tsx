import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { App } from "@/app/App";
import { Button } from "@/components/ui/button";

describe("app routes", () => {
  it("renders the class timetable and navigates to the user directory", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Class Timetable" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "User directory" }));
    expect(
      screen.getByRole("heading", { name: "User Directory" }),
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
