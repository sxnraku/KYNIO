import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import { BarcodeScannerModal } from "@/components/ui/barcode-scanner-modal";
import { ScannedProductModal } from "@/components/ui/scanned-product-modal";
import type { ScannedFoodProduct } from "@/services/barcodeFoodService";

const mockProduct: ScannedFoodProduct = {
  barcode: "5601234567890",
  brand: "Danone",
  imageUrl: "https://images.openfoodfacts.org/mock.jpg",
  name: "Iogurte Grego Natural",
  nutriments: {
    calories100g: 120,
    carbs100g: 5,
    fat100g: 8,
    protein100g: 7,
  },
  scannedAt: Date.now(),
  servingQuantityGrams: 150,
  servingSize: "150g",
};

describe("Barcode UI Modals", () => {
  describe("BarcodeScannerModal", () => {
    it("renderiza o badge gratuito e botão de digitar manualmente", async () => {
      await render(
        <BarcodeScannerModal
          onClose={jest.fn()}
          onProductDetected={jest.fn()}
          visible={true}
        />,
      );

      expect(screen.getByText("Sempre Grátis · Sem Anúncios")).toBeTruthy();
      expect(screen.getByText("Digitar Código Manualmente")).toBeTruthy();
    });

    it("abre o campo de texto manual ao tocar em 'Digitar Código Manualmente'", async () => {
      await render(
        <BarcodeScannerModal
          onClose={jest.fn()}
          onProductDetected={jest.fn()}
          visible={true}
        />,
      );

      const manualButton = screen.getByTestId("manual-barcode-button");
      fireEvent.press(manualButton);

      await waitFor(() => {
        expect(screen.getByTestId("manual-barcode-input")).toBeTruthy();
      });
    });
  });

  describe("ScannedProductModal", () => {
    it("renderiza os detalhes do produto e macros proporcionais", async () => {
      await render(
        <ScannedProductModal
          onClose={jest.fn()}
          onSaveMeal={jest.fn()}
          product={mockProduct}
          visible={true}
        />,
      );

      expect(screen.getByText("Iogurte Grego Natural")).toBeTruthy();
      expect(screen.getByText("Danone")).toBeTruthy();
      expect(screen.getByText("EAN: 5601234567890")).toBeTruthy();
      // Como a porção padrão inicial é 150g (servingQuantityGrams): 120 * 1.5 = 180 kcal
      expect(screen.getByText("180")).toBeTruthy();
    });

    it("chama onSaveMeal ao clicar em 'Registar Refeição · +30 XP'", async () => {
      const handleSave = jest.fn().mockResolvedValue(undefined);

      await render(
        <ScannedProductModal
          onClose={jest.fn()}
          onSaveMeal={handleSave}
          product={mockProduct}
          visible={true}
        />,
      );

      const saveButton = screen.getByText("Registar Refeição · +30 XP");
      fireEvent.press(saveButton);

      expect(handleSave).toHaveBeenCalledWith(
        expect.objectContaining({
          dishName: "Iogurte Grego Natural",
          estimatedCalories: 180,
          proteinGrams: 10.5,
          tags: expect.arrayContaining([
            "Iogurte Grego Natural",
            "barcode:5601234567890",
            "Danone",
          ]),
        }),
      );
    });
  });
});
