
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="42d35097-03a5-5fb8-b9e6-6234af055b72")}catch(e){}}();
export default function parseEnvSeconds(envValue, fallback) {
    if (!envValue)
        return fallback;
    const trimmed = envValue.trim();
    // plain number
    const plain = Number(trimmed);
    if (!Number.isNaN(plain))
        return Math.floor(plain);
    // units:  s, m, h, d, w
    const unitMatch = trimmed.match(/^([0-9]+)\s*([smhdw])$/i);
    if (unitMatch) {
        const [, numStr, unitStr] = unitMatch;
        const value = Number(numStr);
        if (unitStr === undefined)
            return fallback;
        const unit = unitStr.toLowerCase();
        switch (unit) {
            case "s":
                return value;
            case "m":
                return value * 60;
            case "h":
                return value * 60 * 60;
            case "d":
                return value * 24 * 60 * 60;
            case "w":
                return value * 7 * 24 * 60 * 60;
        }
    }
    // allow simple math expressions containing only digits, spaces and +-*/().
    if (/^[0-9+\-*/().\s]+$/.test(trimmed)) {
        try {
            // Use Function to evaluate but only after validation above.
            // eslint-disable-next-line no-new-func
            const result = Function(`return (${trimmed})`)();
            if (typeof result === "number" && Number.isFinite(result))
                return Math.floor(result);
        }
        catch (e) {
            // fallthrough to fallback
        }
    }
    return fallback;
}
//# sourceMappingURL=tokenExpirationParser.js.map
//# debugId=42d35097-03a5-5fb8-b9e6-6234af055b72
