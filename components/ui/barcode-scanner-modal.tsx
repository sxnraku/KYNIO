import { Ionicons } from "@expo/vector-icons";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Modal,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import {
  lookupBarcodeFood,
  type ScannedFoodProduct,
} from "@/services/barcodeFoodService";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

interface BarcodeScannerModalProps {
  onClose: () => void;
  onProductDetected: (product: ScannedFoodProduct) => void;
  visible: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCAN_BOX_WIDTH = Math.min(SCREEN_WIDTH - 64, 300);
const SCAN_BOX_HEIGHT = Math.round(SCAN_BOX_WIDTH * 0.65);

export function BarcodeScannerModal({
  onClose,
  onProductDetected,
  visible,
}: BarcodeScannerModalProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const isProcessingRef = useRef(false);

  const resetAndClose = () => {
    isProcessingRef.current = false;
    setIsLoading(false);
    setErrorMessage(null);
    setShowManualInput(false);
    setManualCode("");
    setTorch(false);
    onClose();
  };

  const handleBarcodeScanned = async (scannedCode: string) => {
    if (isProcessingRef.current || isLoading) {
      return;
    }

    const cleanCode = scannedCode.trim();
    if (!cleanCode) {
      return;
    }

    isProcessingRef.current = true;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Haptics não suportado na plataforma atual
    }

    try {
      const product = await lookupBarcodeFood(cleanCode);

      if (!product) {
        setErrorMessage(
          language === "en"
            ? `Product not found (${cleanCode}). Try typing manually or log with AI photo.`
            : `Produto não encontrado (${cleanCode}). Tenta digitar manualmente ou usar fotografia.`,
        );
        isProcessingRef.current = false;
        setIsLoading(false);
        return;
      }

      resetAndClose();
      onProductDetected(product);
    } catch {
      setErrorMessage(
        language === "en"
          ? "Network error checking barcode. Check connection and retry."
          : "Erro de rede ao consultar o código. Verifica a ligação e tenta de novo.",
      );
      isProcessingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      return;
    }
    await handleBarcodeScanned(manualCode.trim());
  };

  const renderPermissionContent = () => {
    if (!permission) {
      return (
        <View className="flex-1 items-center justify-center bg-[#14120E] px-8">
          <ActivityIndicator color={COLORS.xp} size="large" />
          <Text className="mt-4 font-body text-sm text-neutral-300">
            {translateText("A preparar a câmara…", language)}
          </Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View className="flex-1 items-center justify-center bg-[#14120E] px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
            <Ionicons color={COLORS.xp} name="barcode-outline" size={32} />
          </View>
          <Text className="mt-6 text-center font-headline text-2xl text-white">
            {translateText("Ativar câmara para scan", language)}
          </Text>
          <Text className="mt-3 max-w-[320px] text-center font-body text-sm leading-6 text-neutral-300">
            {translateText(
              "Necessário para ler códigos de barras de embalagens e identificar dados nutricionais.",
              language,
            )}
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-7 w-full max-w-[320px] items-center rounded-2xl bg-amber-600 py-4 active:opacity-80"
            onPress={() => {
              if (permission.canAskAgain) {
                void requestPermission();
              } else {
                void Linking.openSettings();
              }
            }}
          >
            <Text className="font-headline text-base text-white">
              {permission.canAskAgain
                ? translateText("Permitir acesso à câmara", language)
                : translateText("Abrir definições", language)}
            </Text>
          </Pressable>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={resetAndClose}
      statusBarTranslucent
      visible={visible}
    >
      <View className="flex-1 bg-[#14120E]">
        {!permission?.granted ? (
          renderPermissionContent()
        ) : (
          <CameraView
            barcodeScannerSettings={{
              barcodeTypes: [
                "ean13",
                "ean8",
                "upc_a",
                "upc_e",
                "code128",
                "code39",
              ],
            }}
            enableTorch={torch}
            facing="back"
            onBarcodeScanned={(result) => {
              if (result.data) {
                void handleBarcodeScanned(result.data);
              }
            }}
            style={{ flex: 1 }}
          >
            <SafeAreaView className="flex-1 justify-between">
              {/* Header */}
              <View className="flex-row items-center justify-between px-5 pt-3">
                <Pressable
                  accessibilityLabel="Voltar"
                  accessibilityRole="button"
                  className="h-11 w-11 items-center justify-center rounded-full bg-black/60 active:opacity-70"
                  onPress={resetAndClose}
                >
                  <Ionicons color="#FFFFFF" name="close" size={24} />
                </Pressable>

                {/* Badge Gratuito */}
                <View className="flex-row items-center gap-1.5 rounded-full border border-amber-500/40 bg-black/70 px-3.5 py-1.5">
                  <Ionicons color={COLORS.xp} name="shield-checkmark" size={14} />
                  <Text className="font-label text-[10px] uppercase tracking-widest text-amber-300">
                    {language === "en" ? "Free & No Ads" : "Sempre Grátis · Sem Anúncios"}
                  </Text>
                </View>

                {/* Botão de Lanterna */}
                <Pressable
                  accessibilityLabel="Alternar Lanterna"
                  accessibilityRole="button"
                  className={`h-11 w-11 items-center justify-center rounded-full ${
                    torch ? "bg-amber-500" : "bg-black/60"
                  } active:opacity-70`}
                  onPress={() => setTorch((prev) => !prev)}
                >
                  <Ionicons
                    color={torch ? "#14120E" : "#FFFFFF"}
                    name={torch ? "flash" : "flash-outline"}
                    size={22}
                  />
                </Pressable>
              </View>

              {/* Viewfinder Central */}
              <View className="items-center justify-center px-4">
                <View
                  style={{
                    height: SCAN_BOX_HEIGHT,
                    width: SCAN_BOX_WIDTH,
                  }}
                  className="relative items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-500/80 bg-black/25"
                >
                  {/* Cantos estilizados Circadianos */}
                  <View className="absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-amber-400" />
                  <View className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-amber-400" />
                  <View className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-amber-400" />
                  <View className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-amber-400" />

                  {/* Linha laser de scan central */}
                  <View className="h-0.5 w-4/5 bg-amber-400/90 shadow-sm" />

                  {isLoading ? (
                    <View className="absolute inset-0 items-center justify-center bg-black/70">
                      <ActivityIndicator color={COLORS.xp} size="large" />
                      <Text className="mt-2 font-label text-xs uppercase tracking-wider text-amber-300">
                        {language === "en" ? "Searching product..." : "A procurar alimento..."}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text className="mt-4 text-center font-body text-xs text-white/80">
                  {language === "en"
                    ? "Point camera at product barcode"
                    : "Aponta a câmara para o código de barras do produto"}
                </Text>

                {errorMessage ? (
                  <View className="mt-3 max-w-[320px] rounded-xl border border-rose-500/40 bg-black/80 px-4 py-2.5">
                    <Text className="text-center font-body text-xs text-rose-300">
                      {errorMessage}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Footer com Digitação Manual */}
              <View className="px-6 pb-6">
                {showManualInput ? (
                  <View className="rounded-2xl border border-white/20 bg-black/80 p-4">
                    <Text className="font-label text-xs uppercase tracking-wider text-neutral-300">
                      {language === "en" ? "Enter Barcode (Digits)" : "Digitar Código (Apenas dígitos)"}
                    </Text>
                    <View className="mt-2 flex-row gap-2">
                      <TextInput
                        autoFocus
                        className="flex-1 rounded-xl border border-white/30 bg-neutral-900 px-3 py-2 font-label text-sm text-white"
                        keyboardType="numeric"
                        maxLength={18}
                        onChangeText={setManualCode}
                        placeholder="Ex: 5601234567890"
                        placeholderTextColor="#737373"
                        testID="manual-barcode-input"
                        value={manualCode}
                      />
                      <Pressable
                        accessibilityRole="button"
                        className="items-center justify-center rounded-xl bg-amber-500 px-4 active:opacity-80"
                        onPress={handleManualSubmit}
                      >
                        <Text className="font-headline text-xs font-bold text-neutral-950">
                          {language === "en" ? "Search" : "Pesquisar"}
                        </Text>
                      </Pressable>
                    </View>
                    <Pressable
                      className="mt-2.5 items-center py-1"
                      onPress={() => setShowManualInput(false)}
                    >
                      <Text className="font-label text-[11px] uppercase text-neutral-400">
                        {language === "en" ? "Cancel" : "Cancelar"}
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    className="flex-row items-center justify-center gap-2 rounded-2xl border border-white/25 bg-black/60 py-3.5 active:opacity-80"
                    onPress={() => setShowManualInput(true)}
                    testID="manual-barcode-button"
                  >
                    <Ionicons color="#FFFFFF" name="keypad-outline" size={18} />
                    <Text className="font-headline text-xs text-white">
                      {language === "en"
                        ? "Type Barcode Manually"
                        : "Digitar Código Manualmente"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </SafeAreaView>
          </CameraView>
        )}
      </View>
    </Modal>
  );
}
