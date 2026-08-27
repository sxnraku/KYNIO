import {
  calculateLevel,
  calculateLevelProgress,
  getLevelTitle,
  getXpRewardTiers,
} from '@/services/gamificationService';

describe('XP Rewards and Tier Unlock Progression', () => {
  it('calculates unlocked perks based on level and total XP', () => {
    // Level 1 (0 XP)
    const level1Tiers = getXpRewardTiers(50, 1);
    expect(level1Tiers.find((t) => t.id === 'tier-1-base')?.isUnlocked).toBe(true);
    expect(level1Tiers.find((t) => t.id === 'tier-2-visuals')?.isUnlocked).toBe(false);
    expect(level1Tiers.find((t) => t.id === 'tier-5-pro-pass')?.isUnlocked).toBe(false);

    // Level 2 (150 XP)
    const level2Tiers = getXpRewardTiers(150, 2);
    expect(level2Tiers.find((t) => t.id === 'tier-2-visuals')?.isUnlocked).toBe(true);
    expect(level2Tiers.find((t) => t.id === 'tier-3-analytics')?.isUnlocked).toBe(false);

    // Level 5 (1800 XP) -> Unlocks Pro Pass
    const level5Tiers = getXpRewardTiers(1800, 5);
    expect(level5Tiers.find((t) => t.id === 'tier-5-pro-pass')?.isUnlocked).toBe(true);
    expect(level5Tiers.find((t) => t.id === 'tier-7-prestige')?.isUnlocked).toBe(false);

    // Level 7 (3800 XP) -> Unlocks Prestige
    const level7Tiers = getXpRewardTiers(3800, 7);
    expect(level7Tiers.find((t) => t.id === 'tier-7-prestige')?.isUnlocked).toBe(true);
  });

  it('provides appropriate badges and descriptions for all tiers', () => {
    const tiers = getXpRewardTiers(1000, 4);
    for (const tier of tiers) {
      expect(tier.title.length).toBeGreaterThan(0);
      expect(tier.perkBadge.length).toBeGreaterThan(0);
      expect(tier.description.length).toBeGreaterThan(10);
    }
  });
});
