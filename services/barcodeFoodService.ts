import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppLanguage } from "@/store/app-preferences-store";

export interface ScannedFoodNutriments {
  calories100g: number;
  protein100g: number;
  carbs100g: number;
  fat100g: number;
  fiber100g?: number;
  sugars100g?: number;
  sodium100g?: number;
}

export interface FastingImpactAssessment {
  breaksFast: boolean;
  tag: "fasting_friendly" | "breaks_fast";
  title: string;
  description: string;
}

export interface ScannedFoodProduct {
  barcode: string;
  name: string;
  brand: string;
  imageUrl?: string;
  servingSize?: string;
  servingQuantityGrams?: number;
  nutriments: ScannedFoodNutriments;
  ingredientsText?: string;
  scannedAt: number;
}

export interface PortionNutrition {
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugars?: number;
}

const CACHE_PREFIX = "@kynio/scanned_barcode_";
const inMemoryCache = new Map<string, ScannedFoodProduct>();

/**
 * Avalia de forma neutra se o alimento/bebida tem densidade calórica que
 * interrompe o estado metabólico de jejum (< 5 kcal e < 1g carbs = compatível).
 */
export function assessFastingImpact(
  calories: number,
  carbs: number,
  language: AppLanguage = "pt",
): FastingImpactAssessment {
  const isFriendly = calories < 5 && carbs < 1;

  if (isFriendly) {
    return {
      breaksFast: false,
      tag: "fasting_friendly",
      title:
        language === "en"
          ? "Fasting Friendly (<5 kcal)"
          : "Compatível com Jejum (<5 kcal)",
      description:
        language === "en"
          ? "Negligible caloric load. Unlikely to disrupt ketosis or digestive rest."
          : "Carga calórica residual. Improvável que afete a cetose ou o repouso digestivo.",
    };
  }

  return {
    breaksFast: true,
    tag: "breaks_fast",
    title:
      language === "en"
        ? `Breaks Fast (~${Math.round(calories)} kcal)`
        : `Quebra o Jejum (~${Math.round(calories)} kcal)`,
    description:
      language === "en"
        ? "Contains caloric energy and macronutrients that initiate active digestion."
        : "Contém energia calórica e macronutrientes que iniciam a digestão ativa.",
  };
}

/**
 * Calcula os macronutrientes proporcionais para uma dada quantidade em gramas/ml.
 */
export function calculatePortionNutrition(
  product: ScannedFoodProduct,
  grams: number,
): PortionNutrition {
  const safeGrams = Math.max(1, Math.min(2000, Math.round(grams)));
  const ratio = safeGrams / 100;

  const calories = Math.round(product.nutriments.calories100g * ratio);
  const protein = Math.round(product.nutriments.protein100g * ratio * 10) / 10;
  const carbs = Math.round(product.nutriments.carbs100g * ratio * 10) / 10;
  const fat = Math.round(product.nutriments.fat100g * ratio * 10) / 10;
  const fiber =
    product.nutriments.fiber100g !== undefined
      ? Math.round(product.nutriments.fiber100g * ratio * 10) / 10
      : undefined;
  const sugars =
    product.nutriments.sugars100g !== undefined
      ? Math.round(product.nutriments.sugars100g * ratio * 10) / 10
      : undefined;

  return {
    calories,
    carbs,
    fat,
    fiber,
    grams: safeGrams,
    protein,
    sugars,
  };
}

/**
 * Tenta extrair a quantidade em gramas a partir de uma string de dose (ex: "30 g", "250 ml").
 */
function parseServingQuantityGrams(
  servingQuantityRaw?: unknown,
  servingSizeRaw?: string,
): number | undefined {
  if (typeof servingQuantityRaw === "number" && servingQuantityRaw > 0) {
    return Math.round(servingQuantityRaw);
  }
  if (typeof servingQuantityRaw === "string") {
    const parsed = parseFloat(servingQuantityRaw.replace(",", "."));
    if (!isNaN(parsed) && parsed > 0) {
      return Math.round(parsed);
    }
  }
  if (servingSizeRaw) {
    const match = servingSizeRaw.match(/([\d.,]+)\s*(?:g|ml|gr|g\b)/i);
    if (match) {
      const parsed = parseFloat(match[1].replace(",", "."));
      if (!isNaN(parsed) && parsed > 0) {
        return Math.round(parsed);
      }
    }
  }
  return undefined;
}

/**
 * Converte resposta JSON do Open Food Facts v2 em ScannedFoodProduct tipado.
 */
export function normalizeOpenFoodFactsProduct(
  barcode: string,
  rawProduct: Record<string, unknown>,
): ScannedFoodProduct {
  const name =
    (typeof rawProduct.product_name_pt === "string" && rawProduct.product_name_pt.trim()) ||
    (typeof rawProduct.product_name === "string" && rawProduct.product_name.trim()) ||
    (typeof rawProduct.product_name_en === "string" && rawProduct.product_name_en.trim()) ||
    (typeof rawProduct.generic_name_pt === "string" && rawProduct.generic_name_pt.trim()) ||
    (typeof rawProduct.generic_name === "string" && rawProduct.generic_name.trim()) ||
    "Alimento sem nome";

  const brand =
    (typeof rawProduct.brands === "string" && rawProduct.brands.trim()) || "";

  const imageUrl =
    (typeof rawProduct.image_front_url === "string" && rawProduct.image_front_url.trim()) ||
    (typeof rawProduct.image_url === "string" && rawProduct.image_url.trim()) ||
    undefined;

  const servingSize =
    typeof rawProduct.serving_size === "string" && rawProduct.serving_size.trim()
      ? rawProduct.serving_size.trim()
      : undefined;

  const servingQuantityGrams = parseServingQuantityGrams(
    rawProduct.serving_quantity,
    servingSize,
  );

  const nutriments = (rawProduct.nutriments || {}) as Record<string, unknown>;

  // Calorias: preferir energy-kcal_100g, ou energy-kj_100g / 4.184
  let calories100g = 0;
  if (typeof nutriments["energy-kcal_100g"] === "number") {
    calories100g = nutriments["energy-kcal_100g"];
  } else if (typeof nutriments["energy-kcal_100g"] === "string") {
    calories100g = parseFloat(nutriments["energy-kcal_100g"]) || 0;
  } else if (typeof nutriments["energy-kj_100g"] === "number") {
    calories100g = Math.round(nutriments["energy-kj_100g"] / 4.184);
  }

  const getNutrientNum = (key: string): number => {
    const val = nutriments[`${key}_100g`];
    if (typeof val === "number") return Math.max(0, val);
    if (typeof val === "string") return Math.max(0, parseFloat(val) || 0);
    return 0;
  };

  const getOptionalNutrientNum = (key: string): number | undefined => {
    const val = nutriments[`${key}_100g`];
    if (typeof val === "number") return Math.max(0, val);
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : Math.max(0, parsed);
    }
    return undefined;
  };

  const protein100g = Math.round(getNutrientNum("proteins") * 10) / 10;
  const carbs100g = Math.round(getNutrientNum("carbohydrates") * 10) / 10;
  const fat100g = Math.round(getNutrientNum("fat") * 10) / 10;
  const fiber100g = getOptionalNutrientNum("fiber");
  const sugars100g = getOptionalNutrientNum("sugars");
  const sodium100g = getOptionalNutrientNum("sodium");

  const ingredientsText =
    (typeof rawProduct.ingredients_text_pt === "string" &&
      rawProduct.ingredients_text_pt.trim()) ||
    (typeof rawProduct.ingredients_text === "string" &&
      rawProduct.ingredients_text.trim()) ||
    (typeof rawProduct.ingredients_text_en === "string" &&
      rawProduct.ingredients_text_en.trim()) ||
    undefined;

  return {
    barcode,
    brand,
    imageUrl,
    ingredientsText,
    name,
    nutriments: {
      calories100g: Math.max(0, Math.round(calories100g)),
      carbs100g,
      fat100g,
      fiber100g,
      protein100g,
      sodium100g,
      sugars100g,
    },
    scannedAt: Date.now(),
    servingQuantityGrams,
    servingSize,
  };
}

/**
 * Consulta a API pública do Open Food Facts para obter dados nutricionais do código de barras.
 * Utiliza cache em memória e armazenamento local (AsyncStorage) para resposta instantânea e offline.
 */
export async function lookupBarcodeFood(
  barcodeRaw: string,
): Promise<ScannedFoodProduct | null> {
  const barcode = barcodeRaw.trim().replace(/\s+/g, "");
  if (!barcode || !/^\d{4,18}$/.test(barcode)) {
    return null;
  }

  // 1. Memória rápida
  if (inMemoryCache.has(barcode)) {
    return inMemoryCache.get(barcode)!;
  }

  // 2. Cache persistente local
  try {
    const cachedJson = await AsyncStorage.getItem(`${CACHE_PREFIX}${barcode}`);
    if (cachedJson) {
      const cachedProduct = JSON.parse(cachedJson) as ScannedFoodProduct;
      if (cachedProduct && cachedProduct.name) {
        inMemoryCache.set(barcode, cachedProduct);
        return cachedProduct;
      }
    }
  } catch {
    // Falha silenciosa de leitura de cache, continua para rede
  }

  // 3. Consulta à API Open Food Facts v2
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8500);

  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=product_name,product_name_pt,product_name_en,generic_name,generic_name_pt,brands,nutriments,image_url,image_front_url,serving_size,serving_quantity,ingredients_text_pt,ingredients_text,ingredients_text_en`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "KYNIO-Android-App/1.3.3 (https://sxnraku.github.io/KYNIO)",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data?.status !== 1 || !data?.product) {
      return null;
    }

    const normalized = normalizeOpenFoodFactsProduct(barcode, data.product);

    // Guarda na cache em memória e no AsyncStorage
    inMemoryCache.set(barcode, normalized);
    try {
      await AsyncStorage.setItem(
        `${CACHE_PREFIX}${barcode}`,
        JSON.stringify(normalized),
      );
    } catch {
      // Ignora erro de escrita de cache se storage estiver cheio
    }

    return normalized;
  } catch (err) {
    if ((err as Error)?.name === "AbortError") {
      throw new Error("Tempo limite excedido ao consultar o código de barras.");
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
