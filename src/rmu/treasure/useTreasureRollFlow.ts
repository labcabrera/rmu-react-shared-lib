import { useRef, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { rollTreasure } from '../../api/treasure.api';
import { TreasurePendingRoll, TreasureRoll, TreasureRollRequest } from '../../api/treasure.dto';
import { randomDie } from '../../rolls/roll-logic';

/** A die already rolled, with what it was for. */
export type TreasureRollStep = TreasurePendingRoll & { value: number };

export const randomInRange = (min: number, max: number): number => min + randomDie(max - min + 1) - 1;

/**
 * The dice of a treasure (workspace spec 094): they are rolled here and the API only works out the treasure. Each
 * answer says which die comes next, so every request carries all the dice so far; `auto` rolls the rest at once.
 */
export const useTreasureRollFlow = () => {
  const auth = useAuth();
  const [request, setRequest] = useState<TreasureRollRequest | null>(null);
  const [steps, setSteps] = useState<TreasureRollStep[]>([]);
  const [pending, setPending] = useState<TreasurePendingRoll | null>(null);
  const [result, setResult] = useState<TreasureRoll | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const run = useRef(0);

  const advance = async (base: TreasureRollRequest, previous: TreasureRollStep[], auto: boolean) => {
    const id = ++run.current;
    const send = (dice: TreasureRollStep[]) => rollTreasure({ ...base, dice: dice.map((step) => step.value) }, auth);
    setBusy(true);
    setError(null);
    try {
      const current = [...previous];
      let answer = await send(current);
      while (auto && answer.pending && id === run.current) {
        const die = answer.pending;
        current.push({ ...die, value: randomInRange(die.min, die.max) });
        answer = await send(current);
      }
      if (id !== run.current) return;
      setSteps(current);
      setPending(answer.pending ?? null);
      setResult(answer.pending ? null : answer);
    } catch (err) {
      if (id === run.current) setError(err);
    } finally {
      if (id === run.current) setBusy(false);
    }
  };

  const start = (base: TreasureRollRequest, auto: boolean) => {
    setRequest(base);
    setSteps([]);
    setPending(null);
    setResult(null);
    return advance(base, [], auto);
  };

  const enter = (value: number) => {
    if (!request || !pending) return Promise.resolve();
    return advance(request, [...steps, { ...pending, value }], false);
  };

  const undo = () => {
    if (!request || steps.length === 0) return Promise.resolve();
    return advance(request, steps.slice(0, -1), false);
  };

  const rollRest = () => (request ? advance(request, steps, true) : Promise.resolve());

  const reset = () => {
    run.current++;
    setRequest(null);
    setSteps([]);
    setPending(null);
    setResult(null);
    setBusy(false);
    setError(null);
  };

  return { steps, pending, result, busy, error, active: request !== null, start, enter, undo, rollRest, reset };
};
