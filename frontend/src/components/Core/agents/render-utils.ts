const CANDIDATE_TEXT_KEYS = [
    'title',
    'name',
    'label',
    'headline',
    'summary',
    'description',
    'content',
    'text',
    'message',
    'issue',
    'fix_instruction',
    'question',
    'answer',
    'value',
    'citation',
    'caption',
];

function humanizeKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseJsonLikeString(value: string): any {
    const trimmed = value.trim();
    if (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
        try {
            return JSON.parse(trimmed);
        } catch {
            return value;
        }
    }
    return value;
}

function primitiveToString(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return '';
}

function objectToString(value: Record<string, any>, depth: number): string {
    for (const key of CANDIDATE_TEXT_KEYS) {
        const v = value[key];
        const s = primitiveToString(v);
        if (s) return s;
    }

    const entries = Object.entries(value).filter(([, v]) => v !== null && v !== undefined);
    if (entries.length === 0) return '';

    const preview = entries.slice(0, 4).map(([k, v]) => {
        const str = formatStructuredValue(v, undefined, undefined, depth + 1);
        return `${humanizeKey(k)}: ${str}`;
    });
    return preview.join(' | ');
}

// Keep signature compatible with formatStructuredValue(value, replacer?, space?)
export function formatStructuredValue(
    value: any,
    _replacer?: any,
    _space?: any,
    depth = 0,
): string {
    if (depth > 3) return primitiveToString(value) || '[Complex Value]';

    if (typeof value === 'string') {
        const parsed = parseJsonLikeString(value);
        if (parsed === value) return value;
        return formatStructuredValue(parsed, undefined, undefined, depth + 1);
    }

    const primitive = primitiveToString(value);
    if (primitive) return primitive;

    if (Array.isArray(value)) {
        const items = value
            .map((item) => formatStructuredValue(item, undefined, undefined, depth + 1))
            .filter(Boolean);
        return items.join(', ');
    }

    if (value && typeof value === 'object') {
        return objectToString(value, depth + 1);
    }

    return String(value);
}

