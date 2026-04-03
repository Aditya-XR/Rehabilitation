const DURATION_PATTERN = /^(\d+)([smhd])$/i;

const UNIT_TO_MS = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
};

export const durationToMs = (value, fallbackMs) => {
    if (typeof value === "number") {
        return value;
    }

    const match = String(value || "").match(DURATION_PATTERN);

    if (!match) {
        return fallbackMs;
    }

    const [, amount, unit] = match;
    return Number(amount) * UNIT_TO_MS[unit.toLowerCase()];
};
