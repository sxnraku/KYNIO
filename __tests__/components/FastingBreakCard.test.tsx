import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { FastingBreakCard } from '@/components/ui/fasting-break-card';
import type { FastingBreakAnalysis } from '@/types/fasting-break';

describe('FastingBreakCard', () => {
  const mockCleanAnalysis: FastingBreakAnalysis = {
    autophagyDisrupted: false,
    breaksFasting: false,
    confidence: 'high',
    explanation: 'Sem calorias nem hidratos significativos. Não quebra o jejum.',
    explanationEn: 'Zero calories or carbs. Does not break fasting.',
    impact: 'clean',
    ketoSafe: true,
    productName: 'Café Preto',
    sensitiveIngredients: [],
    verdictTitle: 'Seguro para Jejum',
    verdictTitleEn: 'Fast-Safe',
  };

  const mockBreakAnalysis: FastingBreakAnalysis = {
    autophagyDisrupted: true,
    breaksFasting: true,
    confidence: 'high',
    explanation: 'Contém açúcar e whey protein que provocam pico insulínico.',
    explanationEn: 'Contains sugar and whey protein which trigger an insulin spike.',
    impact: 'metabolic_break',
    ketoSafe: false,
    productName: 'Bebida Energética com Açúcar',
    sensitiveIngredients: ['Açúcar', 'Whey'],
    verdictTitle: 'Quebra Jejum Metabólico',
    verdictTitleEn: 'Breaks Fast',
  };

  it('renderiza veredicto limpo de jejum seguro com título e explicação', async () => {
    const { getByText } = await render(
      <FastingBreakCard analysis={mockCleanAnalysis} />,
    );

    expect(getByText('Café Preto')).toBeTruthy();
    expect(getByText('Seguro para Jejum')).toBeTruthy();
    expect(getByText('Sem calorias nem hidratos significativos. Não quebra o jejum.')).toBeTruthy();
  });

  it('renderiza veredicto com quebra de jejum e lista de ingredientes sensíveis', async () => {
    const onDismiss = jest.fn();
    const { getByText } = await render(
      <FastingBreakCard analysis={mockBreakAnalysis} onDismiss={onDismiss} />,
    );

    expect(getByText('Bebida Energética com Açúcar')).toBeTruthy();
    expect(getByText('Quebra Jejum Metabólico')).toBeTruthy();
    expect(getByText('Açúcar')).toBeTruthy();
    expect(getByText('Whey')).toBeTruthy();

    const closeBtn = getByText('Fechar resultado');
    fireEvent.press(closeBtn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('apresenta botão para terminar jejum ativo quando o alimento quebra o jejum', async () => {
    const { useFastingStore } = require('@/store/useFastingStore');
    const endFastingSpy = jest.fn().mockResolvedValue(undefined);

    useFastingStore.setState({
      endFasting: endFastingSpy,
      isActive: true,
      startedAt: Date.now() - 3600000,
    });

    const { getByTestId, getByText } = await render(
      <FastingBreakCard analysis={mockBreakAnalysis} />,
    );

    expect(getByText('Jejum em Curso')).toBeTruthy();
    const endBtn = getByTestId('end-fast-from-break-card-button');
    expect(endBtn).toBeTruthy();

    fireEvent.press(endBtn);
    expect(endFastingSpy).toHaveBeenCalledTimes(1);
  });
});
