import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { UsersDemoPage } from "@/features/users-demo";
import {
  fetchUsersPage,
  resetActivityAttempts,
} from "@/features/users-demo/services/usersDemo.service";

function renderPage(route = "/demo") {
  render(
    <MemoryRouter initialEntries={[route]}>
      <UsersDemoPage />
    </MemoryRouter>,
  );
}

function userRow(name: string) {
  return screen.getByText(name).closest("tr")!;
}

beforeEach(resetActivityAttempts);

describe("User Directory reuse proof", () => {
  it("maps server sort keys, sorts the full dataset, then returns only the requested page", async () => {
    const controller = new AbortController();
    const page = await fetchUsersPage(
      { page: 2, pageSize: 5, sortBy: "createdAt", sortOrder: "desc" },
      controller.signal,
    );
    expect(page.totalCount).toBe(72);
    expect(page.items).toHaveLength(5);
    expect(page.items[0]?.id).toBe("user-067");
    const invalid = await fetchUsersPage(
      { page: 1, pageSize: 5, sortBy: "unknown", sortOrder: "asc" },
      controller.signal,
    );
    expect(invalid.items[0]?.id).toBe("user-001");
  });

  it("renders server pages without another client slice and resets page on size or sort changes", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByText("Loading table data")).toBeInTheDocument();
    expect(await screen.findByText("Avery Morgan")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 8")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(await screen.findByText("Casey Flores")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 8")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Rows per page"), "5");
    await waitFor(() =>
      expect(screen.getByText("Page 1 of 15")).toBeInTheDocument(),
    );
    expect(await screen.findByText("Avery Morgan")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    await waitFor(() =>
      expect(screen.getByText("Page 2 of 15")).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "Created" }));
    await waitFor(() =>
      expect(screen.getByText("Page 1 of 15")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("columnheader", { name: "Created" }),
    ).toHaveAttribute("aria-sort", "ascending");
    await user.click(screen.getByRole("button", { name: "Created" }));
    expect(await screen.findByText("Rowan Rivera")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Created" }),
    ).toHaveAttribute("aria-sort", "descending");
  });

  it("supports initial error/retry and an empty server response", async () => {
    const user = userEvent.setup();
    renderPage("/demo?fixture=error");
    expect(
      await screen.findByText("Users could not be loaded. Please try again."),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Retry loading users" }),
    );
    expect(await screen.findByText("Avery Morgan")).toBeInTheDocument();
  });

  it("shows empty parent data", async () => {
    renderPage("/demo?fixture=empty");
    expect(await screen.findByText("No data available")).toBeInTheDocument();
  });

  it("loads, caches, renders empty activity, and retries row-local errors", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Avery Morgan");
    const first = userRow("Avery Morgan");
    await user.click(within(first).getByRole("button", { name: "Expand row" }));
    expect(screen.getByText("Loading details")).toBeInTheDocument();
    expect(
      await screen.findByRole("region", { name: "Activity for Avery Morgan" }),
    ).toHaveTextContent("Signed in");
    await user.click(
      within(first).getByRole("button", { name: "Collapse row" }),
    );
    await user.click(within(first).getByRole("button", { name: "Expand row" }));
    expect(screen.queryByText("Loading details")).not.toBeInTheDocument();
    await user.click(
      within(userRow("Jordan Chen")).getByRole("button", {
        name: "Expand row",
      }),
    );
    expect(
      await screen.findByText("No recent activity for Jordan Chen."),
    ).toBeInTheDocument();
    await user.click(
      within(userRow("Morgan Patel")).getByRole("button", {
        name: "Expand row",
      }),
    );
    expect(
      await screen.findByText("Activity for Morgan Patel could not be loaded."),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Retry loading details" }),
    );
    expect(
      await screen.findByRole("region", { name: "Activity for Morgan Patel" }),
    ).toHaveTextContent("Updated profile");
  });

  it("ignores a slower superseded request", async () => {
    const user = userEvent.setup();
    renderPage("/demo?fixture=slow");
    await user.click(screen.getByRole("button", { name: "Created" }));
    await user.click(screen.getByRole("button", { name: "Created" }));
    expect(await screen.findByText("Rowan Rivera")).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 1400));
    expect(screen.getByText("Rowan Rivera")).toBeInTheDocument();
    expect(screen.queryByText("Avery Morgan")).not.toBeInTheDocument();
  });
});
