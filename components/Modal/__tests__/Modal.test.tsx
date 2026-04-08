/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { createRef } from "react";
import Modal from "../index";

describe("Modal component", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  // Req 2.1: Full-screen overlay with semi-transparent dark background
  it("renders overlay when open", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  // Req 2.8: role="dialog" and aria-modal="true"
  it("sets role='dialog' and aria-modal='true'", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
  });

  // Req 2.2: Scrollable content area centered on viewport
  it("renders title and children", () => {
    render(
      <Modal open={true} onClose={() => {}} title="My Title">
        <p>Hello World</p>
      </Modal>,
    );

    expect(screen.getByText("My Title")).toBeTruthy();
    expect(screen.getByText("Hello World")).toBeTruthy();
  });

  // Req 2.3: Close button (X) closes the modal
  it("calls onClose when close button (X) is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    );

    const closeBtn = screen.getByLabelText("Cerrar");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // Req 2.4: Close on overlay click
  it("calls onClose when overlay is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    );

    // The overlay is the first child div inside the dialog
    const dialog = screen.getByRole("dialog");
    const overlay = dialog.children[0] as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // Req 2.5: Close on Escape key
  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose for non-Escape keys", () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });

  // Req 2.6: Scroll lock on body
  it("applies scroll lock when open and restores on unmount", () => {
    const { unmount } = render(
      <Modal open={true} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("does not apply scroll lock when closed", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>,
    );

    expect(document.body.style.overflow).not.toBe("hidden");
  });

  // Req 2.3 (focus return): Returns focus to triggerRef on close
  it("returns focus to triggerRef when modal closes", () => {
    const triggerRef = createRef<HTMLButtonElement>();

    // Render a button to act as trigger
    const { rerender } = render(
      <div>
        <button ref={triggerRef}>Trigger</button>
        <Modal open={true} onClose={() => {}} title="Test" triggerRef={triggerRef}>
          <p>Content</p>
        </Modal>
      </div>,
    );

    const focusSpy = vi.spyOn(triggerRef.current!, "focus");

    // Close the modal by re-rendering with open=false
    rerender(
      <div>
        <button ref={triggerRef}>Trigger</button>
        <Modal open={false} onClose={() => {}} title="Test" triggerRef={triggerRef}>
          <p>Content</p>
        </Modal>
      </div>,
    );

    expect(focusSpy).toHaveBeenCalled();
    focusSpy.mockRestore();
  });

  // Children rendering
  it("renders complex children correctly", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Complex">
        <div data-testid="child-1">First</div>
        <div data-testid="child-2">Second</div>
      </Modal>,
    );

    expect(screen.getByTestId("child-1")).toBeTruthy();
    expect(screen.getByTestId("child-2")).toBeTruthy();
  });
});
