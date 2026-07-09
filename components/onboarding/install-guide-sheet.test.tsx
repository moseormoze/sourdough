import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InstallGuideSheet } from "./install-guide-sheet";
import { strings } from "@/lib/strings";

describe("InstallGuideSheet", () => {
  it("renders the three numbered iOS steps when open", () => {
    render(<InstallGuideSheet open onClose={vi.fn()} />);
    expect(screen.getByText(strings.install.guideTitle)).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent(strings.install.guideStep1);
    expect(items[1]).toHaveTextContent(strings.install.guideStep2);
    expect(items[2]).toHaveTextContent(strings.install.guideStep3);
  });

  it("renders nothing when closed", () => {
    render(<InstallGuideSheet open={false} onClose={vi.fn()} />);
    expect(screen.queryByText(strings.install.guideTitle)).not.toBeInTheDocument();
  });
});
