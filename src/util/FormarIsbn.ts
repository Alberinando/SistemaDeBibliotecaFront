function formatIsbn(raw: string) {
    const parts = [];
    const digits = raw.slice(0, 13);
    if (digits.length > 0) parts.push(digits.slice(0, 3));
    if (digits.length >= 4) parts.push(digits.slice(3, 4));
    if (digits.length >= 5) parts.push(digits.slice(4, 8));
    if (digits.length >= 9) parts.push(digits.slice(8, 12));
    if (digits.length >= 13) parts.push(digits.slice(12, 13));
    return parts.filter(Boolean).join('-');
}

export default formatIsbn;
