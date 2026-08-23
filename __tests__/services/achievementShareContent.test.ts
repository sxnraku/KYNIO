import {
  APP_SHARE_URL,
  buildAchievementShareMessage,
} from '@/services/achievementShareContent';
import { translateText } from '@/services/i18n';

describe('achievement share content', () => {
  it('inclui o link público e as conquistas na mensagem portuguesa', () => {
    const message = buildAchievementShareMessage({
      badgeTitles: ['Primeiro Objetivo'],
      language: 'pt',
      level: 2,
      levelTitle: 'Iniciado',
      streakDays: 3,
      totalXp: 120,
    });

    expect(message).toContain(APP_SHARE_URL);
    expect(message).toContain('Primeiro Objetivo');
    expect(message).toContain('Nível 2');
  });

  it('gera a mensagem e os níveis em inglês', () => {
    const message = buildAchievementShareMessage({
      badgeTitles: ['Primeiro Objetivo'],
      language: 'en',
      level: 2,
      levelTitle: 'Iniciado',
      streakDays: 3,
      totalXp: 120,
    });

    expect(message).toContain('Level 2 · Initiated');
    expect(message).toContain('First Target');
    expect(message).toContain(APP_SHARE_URL);
    expect(translateText('Nível 5: Disciplinado', 'en')).toBe('Level 5 - Disciplined');
  });
});
