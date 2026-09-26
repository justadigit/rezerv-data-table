import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { ClassTimetablePage } from "@/features/class-timetable";
import { resetRosterAttempts } from "@/features/class-timetable/services/classTimetable.service";

function renderPage(route = "/") {
  render(
    <MemoryRouter initialEntries={[route]}>
      <ClassTimetablePage />
    </MemoryRouter>,
  );
}

function section(name: string) {
  return screen.getByRole("heading", { name }).closest("section")!;
}

function classRow(area: HTMLElement, name: string) {
  return within(area).getAllByText(name)[0]!.closest("tr")!;
}

beforeEach(resetRosterAttempts);

describe("class timetable integration", () => {
  it("shows loading, class fields, status, sorting, pagination, and inline attendees", async () => {
    const user = userEvent.setup();
    renderPage();
    const schedule = section("Class schedule");
    expect(
      within(schedule).getByText("Loading table data"),
    ).toBeInTheDocument();
    await within(schedule).findByText("Strength Fundamentals");
    expect(within(schedule).getAllByText("Studio A").length).toBeGreaterThan(0);
    expect(within(schedule).getAllByText("Jordan Lee").length).toBeGreaterThan(
      0,
    );
    expect(within(schedule).getByText("5 / 16")).toBeInTheDocument();
    expect(within(schedule).getAllByText("Scheduled").length).toBeGreaterThan(
      0,
    );
    expect(
      within(schedule).getByRole("columnheader", { name: /Class/ }),
    ).toHaveAttribute("aria-sort", "none");

    await user.click(
      within(schedule).getByRole("button", { name: /Attendance/ }),
    );
    expect(
      within(schedule).getByRole("columnheader", { name: /Attendance/ }),
    ).toHaveAttribute("aria-sort", "ascending");
    expect(within(schedule).getAllByRole("row")[1]).toHaveTextContent(
      "Morning Flow Yoga",
    );
    await user.click(within(schedule).getByRole("button", { name: /Status/ }));
    expect(within(schedule).getAllByRole("row")[1]).toHaveTextContent(
      "Strength Fundamentals",
    );

    await user.click(
      within(schedule).getByRole("button", { name: "Next page" }),
    );
    expect(within(schedule).getByText("Page 2 of 4")).toBeInTheDocument();
    await user.selectOptions(
      within(schedule).getByLabelText("Rows per page"),
      "10",
    );
    expect(within(schedule).getByText("Page 1 of 2")).toBeInTheDocument();

    await user.click(
      within(classRow(schedule, "Morning Flow Yoga")).getByRole("button", {
        name: "Expand row",
      }),
    );
    expect(
      within(schedule).getByText(
        "No attendees are registered for Morning Flow Yoga.",
      ),
    ).toBeInTheDocument();
    await user.click(
      within(classRow(schedule, "Strength Fundamentals")).getByRole("button", {
        name: "Expand row",
      }),
    );
    const attendees = within(schedule).getByRole("region", {
      name: "Attendees for Strength Fundamentals",
    });
    expect(within(attendees).getByText("Maya Chen")).toBeInTheDocument();
    expect(within(attendees).getAllByText("Checked in").length).toBeGreaterThan(
      0,
    );
  });

  it("shows a retryable initial error and then loads classes", async () => {
    const user = userEvent.setup();
    renderPage("/?fixture=error");
    expect(
      await screen.findByText("Classes could not be loaded. Please try again."),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Retry loading classes" }),
    );
    expect(screen.getByText("Loading table data")).toBeInTheDocument();
    expect(
      await within(section("Class schedule")).findByText(
        "Strength Fundamentals",
      ),
    ).toBeInTheDocument();
  });

  it("shows an empty parent table", async () => {
    renderPage("/?fixture=empty");
    expect(await screen.findByText("No data available")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Live rosters" }),
    ).not.toBeInTheDocument();
  });

  it("loads, retries, renders empty results, and reuses cached rosters", async () => {
    const user = userEvent.setup();
    renderPage();
    const roster = await screen.findByRole("heading", { name: "Live rosters" });
    const live = roster.closest("section")!;

    const success = classRow(live, "Power Vinyasa");
    await user.click(
      within(success).getByRole("button", { name: "Expand row" }),
    );
    expect(within(live).getByText("Loading details")).toBeInTheDocument();
    const attendee = await within(live).findByRole("region", {
      name: "Attendees for Power Vinyasa",
    });
    expect(within(attendee).getByText("Noah Williams")).toBeInTheDocument();
    await user.click(
      within(success).getByRole("button", { name: "Collapse row" }),
    );
    await user.click(
      within(success).getByRole("button", { name: "Expand row" }),
    );
    expect(within(live).queryByText("Loading details")).not.toBeInTheDocument();
    expect(
      within(live).getByRole("region", { name: "Attendees for Power Vinyasa" }),
    ).toBeInTheDocument();

    await user.click(
      within(classRow(live, "Boxing Basics")).getByRole("button", {
        name: "Expand row",
      }),
    );
    expect(
      await within(live).findByText(
        "No attendees are registered for Boxing Basics.",
      ),
    ).toBeInTheDocument();
    await user.click(
      within(classRow(live, "Boxing Basics")).getByRole("button", {
        name: "Collapse row",
      }),
    );
    await user.click(
      within(classRow(live, "Boxing Basics")).getByRole("button", {
        name: "Expand row",
      }),
    );
    expect(
      within(live).getByText("No attendees are registered for Boxing Basics."),
    ).toBeInTheDocument();
    expect(within(live).queryByText("Loading details")).not.toBeInTheDocument();

    await user.click(
      within(classRow(live, "Mobility Lab")).getByRole("button", {
        name: "Expand row",
      }),
    );
    expect(
      await within(live).findByText(
        "Attendees for Mobility Lab could not be loaded.",
      ),
    ).toBeInTheDocument();
    await user.click(
      within(live).getByRole("button", { name: "Retry loading details" }),
    );
    await waitFor(() =>
      expect(
        within(live).getByRole("region", {
          name: "Attendees for Mobility Lab",
        }),
      ).toBeInTheDocument(),
    );
  });
});
