import { PwaInstallBanner as NativeBanner } from "@/components/ui/pwa-install-banner";
import { PwaInstallBanner as WebBanner } from "@/components/ui/pwa-install-banner.web";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

describe("PwaInstallBanner", () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: (key: string) => mockStore[key] ?? null,
        setItem: (key: string, val: string) => {
          mockStore[key] = val;
        },
        clear: () => {
          mockStore = {};
        },
      },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "navigator", {
      value: {
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "window", {
      value: {
        matchMedia: () => ({ matches: false }),
      },
      writable: true,
      configurable: true,
    });
  });

  it("returns null in native fallback component", async () => {
    const { toJSON } = await render(<NativeBanner />);
    expect(toJSON()).toBeNull();
  });

  it("renders installation guide when viewed on iOS Safari", async () => {
    await render(<WebBanner />);
    expect(screen.getByText("Instala o KYNIO no teu iPhone")).toBeTruthy();
  });

  it("can be dismissed by tapping the close button", async () => {
    await render(<WebBanner />);
    expect(screen.getByText("Instala o KYNIO no teu iPhone")).toBeTruthy();

    fireEvent.press(screen.getByTestId("close-pwa-banner"));
    await waitFor(() => {
      expect(screen.queryByText("Instala o KYNIO no teu iPhone")).toBeNull();
    });
    expect(mockStore.kynio_pwa_prompt_dismissed).toBe("true");
  });
});

