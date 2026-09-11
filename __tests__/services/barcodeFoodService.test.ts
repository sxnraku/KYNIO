import {
  assessFastingImpact,
  calculatePortionNutrition,
  lookupBarcodeFood,
  normalizeOpenFoodFactsProduct,
  type ScannedFoodProduct,
} from "@/services/barcodeFoodService";

describe("barcodeFoodService", () => {
  describe("assessFastingImpact", () => {
    it("classifica alimentos com menos de 5 kcal e <1g hidratos como compatíveis com o jejum", () => {
      const assessmentPt = assessFastingImpact(2, 0.2, "pt");
      expect(assessmentPt.breaksFast).toBe(false);
      expect(assessmentPt.tag).toBe("fasting_friendly");
      expect(assessmentPt.title).toContain("Compatível com Jejum");

      const assessmentEn = assessFastingImpact(0, 0, "en");
      expect(assessmentEn.breaksFast).toBe(false);
      expect(assessmentEn.title).toContain("Fasting Friendly");
    });

    it("classifica alimentos com calorias relevantes como quebra de jejum", () => {
      const assessmentPt = assessFastingImpact(150, 20, "pt");
      expect(assessmentPt.breaksFast).toBe(true);
      expect(assessmentPt.tag).toBe("breaks_fast");
      expect(assessmentPt.title).toContain("Quebra o Jejum");
      expect(assessmentPt.title).toContain("150 kcal");

      const assessmentEn = assessFastingImpact(60, 5, "en");
      expect(assessmentEn.breaksFast).toBe(true);
      expect(assessmentEn.title).toContain("Breaks Fast");
    });
  });

  describe("calculatePortionNutrition", () => {
    const mockProduct: ScannedFoodProduct = {
      barcode: "5601234567890",
      brand: "Marca Teste",
      name: "Iogurte Natural",
      nutriments: {
        calories100g: 60,
        carbs100g: 4.5,
        fat100g: 3.2,
        fiber100g: 0,
        protein100g: 3.5,
        sugars100g: 4.5,
      },
      scannedAt: Date.now(),
    };

    it("calcula valores idênticos para uma porção de 100g", () => {
      const portion = calculatePortionNutrition(mockProduct, 100);
      expect(portion.grams).toBe(100);
      expect(portion.calories).toBe(60);
      expect(portion.protein).toBe(3.5);
      expect(portion.carbs).toBe(4.5);
      expect(portion.fat).toBe(3.2);
    });

    it("calcula valores proporcionais para 200g (2x)", () => {
      const portion = calculatePortionNutrition(mockProduct, 200);
      expect(portion.grams).toBe(200);
      expect(portion.calories).toBe(120);
      expect(portion.protein).toBe(7);
      expect(portion.carbs).toBe(9);
      expect(portion.fat).toBe(6.4);
    });

    it("calcula valores proporcionais para 50g (0.5x)", () => {
      const portion = calculatePortionNutrition(mockProduct, 50);
      expect(portion.grams).toBe(50);
      expect(portion.calories).toBe(30);
      expect(portion.protein).toBe(1.8);
      expect(portion.carbs).toBe(2.3);
      expect(portion.fat).toBe(1.6);
    });
  });

  describe("normalizeOpenFoodFactsProduct", () => {
    it("normaliza corretamente o payload bruto da API", () => {
      const raw = {
        brands: "Super Alimento",
        "energy-kcal_100g": 250,
        image_front_url: "https://images.openfoodfacts.org/front.jpg",
        nutriments: {
          carbohydrates_100g: 30,
          "energy-kcal_100g": 250,
          fat_100g: 8,
          fiber_100g: 5,
          proteins_100g: 12,
          sodium_100g: 0.4,
          sugars_100g: 10,
        },
        product_name_pt: "Barra de Proteína",
        serving_quantity: 45,
        serving_size: "45 g",
      };

      const result = normalizeOpenFoodFactsProduct("5609999999999", raw);

      expect(result.barcode).toBe("5609999999999");
      expect(result.name).toBe("Barra de Proteína");
      expect(result.brand).toBe("Super Alimento");
      expect(result.imageUrl).toBe("https://images.openfoodfacts.org/front.jpg");
      expect(result.servingSize).toBe("45 g");
      expect(result.servingQuantityGrams).toBe(45);
      expect(result.nutriments.calories100g).toBe(250);
      expect(result.nutriments.protein100g).toBe(12);
      expect(result.nutriments.carbs100g).toBe(30);
      expect(result.nutriments.fat100g).toBe(8);
      expect(result.nutriments.fiber100g).toBe(5);
    });

    it("converte energia em kJ para kcal quando kcal não está presente", () => {
      const raw = {
        nutriments: {
          "energy-kj_100g": 837, // ~200 kcal
          proteins_100g: 5,
        },
        product_name: "Bebida de Soja",
      };

      const result = normalizeOpenFoodFactsProduct("12345678", raw);
      expect(result.name).toBe("Bebida de Soja");
      expect(result.nutriments.calories100g).toBe(200);
    });
  });

  describe("lookupBarcodeFood", () => {
    it("rejeita códigos vazios ou com caracteres não-numéricos", async () => {
      const resultEmpty = await lookupBarcodeFood("");
      expect(resultEmpty).toBeNull();

      const resultInvalid = await lookupBarcodeFood("abc-not-a-code");
      expect(resultInvalid).toBeNull();
    });

    it("retorna produto mockado via fetch com sucesso", async () => {
      const originalFetch = globalThis.fetch;
      const mockResponse = {
        product: {
          brands: "Compal",
          nutriments: {
            carbohydrates_100g: 11,
            "energy-kcal_100g": 48,
            fat_100g: 0.1,
            proteins_100g: 0.5,
          },
          product_name_pt: "Sumo de Laranja do Algarve",
        },
        status: 1,
      };

      globalThis.fetch = jest.fn().mockResolvedValue({
        json: async () => mockResponse,
        ok: true,
      } as unknown as Response);

      try {
        const product = await lookupBarcodeFood("5601000100010");
        expect(product).not.toBeNull();
        expect(product?.name).toBe("Sumo de Laranja do Algarve");
        expect(product?.brand).toBe("Compal");
        expect(product?.nutriments.calories100g).toBe(48);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
