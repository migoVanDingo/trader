import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IndicatorMenu } from "./IndicatorMenu";
import { useStore } from "../../state/store";

describe("IndicatorMenu", () => {
  beforeEach(() => {
    useStore.setState({
      ma: [20, 50],
      showRSI: false,
      showVolume: true,
    });
  });

  it("opens the panel and toggles RSI in the store", async () => {
    const user = userEvent.setup();
    render(<IndicatorMenu />);

    // Panel is closed initially.
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /indicators/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    expect(useStore.getState().showRSI).toBe(false);
    await user.click(screen.getByRole("checkbox", { name: /rsi/i }));
    expect(useStore.getState().showRSI).toBe(true);
  });

  it("toggles an MA period off when already active", async () => {
    const user = userEvent.setup();
    render(<IndicatorMenu />);

    await user.click(screen.getByRole("button", { name: /indicators/i }));
    await user.click(screen.getByRole("checkbox", { name: /^MA 20$/ }));
    expect(useStore.getState().ma).not.toContain(20);
  });
});
