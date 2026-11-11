/** A bonus or modifier as text, with `+` when it is positive (`+5`, `0`, `-5`). */
export const signed = (value: number): string => (value > 0 ? `+${value}` : `${value}`);
