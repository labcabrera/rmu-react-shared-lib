export interface ObAttack {
  attackName: string;
  currentBo: number;
}

/**
 * OB an attack action leaves to every attack of the actor (workspace spec 082, ADR 0012); rmu-api-tactical has the last
 * word. With one attack it spends from the best OB of those the actor can use, so a weak attack does not use up the
 * main weapon; with several, it is the least any of them has left. Null when the action spends no OB.
 */
export const obMargin = (usable: ObAttack[], spends: { attackName: string; bo: number }[]): number | null => {
  const used = spends.filter((spend) => spend.bo > 0);
  if (used.length === 0) return null;
  const currentOf = (attackName: string) => usable.find((attack) => attack.attackName === attackName)?.currentBo ?? 0;
  const margin =
    used.length === 1
      ? Math.max(...usable.map((attack) => attack.currentBo), currentOf(used[0].attackName)) - used[0].bo
      : Math.min(...used.map((spend) => currentOf(spend.attackName) - spend.bo));
  return Math.max(0, margin);
};
