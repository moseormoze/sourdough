import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FeedbackSheet } from "./feedback-sheet";
import { strings } from "@/lib/strings";

vi.mock("@/lib/utils/compress-image", () => ({
  compressImage: vi.fn().mockResolvedValue("data:image/jpeg;base64,mockdata"),
}));

const mockShow = vi.fn();
vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ show: mockShow, dismiss: vi.fn() }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

function renderSheet(onClose = vi.fn()) {
  return render(<FeedbackSheet open={true} onClose={onClose} />);
}

describe("FeedbackSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  it("renders all feedback type options", () => {
    renderSheet();
    expect(screen.getByRole("button", { name: strings.feedback.typeBug })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: strings.feedback.typeFeature })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: strings.feedback.typeQuestion })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: strings.feedback.typeOther })).toBeInTheDocument();
  });

  it("submit button is disabled when type is not selected", () => {
    renderSheet();
    const textarea = screen.getByPlaceholderText(strings.feedback.descriptionPlaceholder);
    fireEvent.change(textarea, { target: { value: "some description" } });
    expect(screen.getByRole("button", { name: strings.feedback.submit })).toBeDisabled();
  });

  it("submit button is disabled when description is empty", () => {
    renderSheet();
    fireEvent.click(screen.getByRole("button", { name: strings.feedback.typeBug }));
    expect(screen.getByRole("button", { name: strings.feedback.submit })).toBeDisabled();
  });

  it("submit button is enabled when type and description are filled", () => {
    renderSheet();
    fireEvent.click(screen.getByRole("button", { name: strings.feedback.typeBug }));
    const textarea = screen.getByPlaceholderText(strings.feedback.descriptionPlaceholder);
    fireEvent.change(textarea, { target: { value: "some description" } });
    expect(screen.getByRole("button", { name: strings.feedback.submit })).not.toBeDisabled();
  });

  it("successful submit calls onClose and shows toast", async () => {
    const onClose = vi.fn();
    renderSheet(onClose);

    fireEvent.click(screen.getByRole("button", { name: strings.feedback.typeBug }));
    fireEvent.change(screen.getByPlaceholderText(strings.feedback.descriptionPlaceholder), {
      target: { value: "test bug description" },
    });
    fireEvent.click(screen.getByRole("button", { name: strings.feedback.submit }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/feedback", expect.objectContaining({ method: "POST" }));
      expect(onClose).toHaveBeenCalled();
      expect(mockShow).toHaveBeenCalledWith(strings.feedback.successToast, expect.anything());
    });
  });

  it("failed submit shows error message and does not close", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    const onClose = vi.fn();
    renderSheet(onClose);

    fireEvent.click(screen.getByRole("button", { name: strings.feedback.typeQuestion }));
    fireEvent.change(screen.getByPlaceholderText(strings.feedback.descriptionPlaceholder), {
      target: { value: "my question" },
    });
    fireEvent.click(screen.getByRole("button", { name: strings.feedback.submit }));

    await waitFor(() => {
      expect(screen.getByText(strings.feedback.errorMessage)).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
