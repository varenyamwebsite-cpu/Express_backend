export function getUsername(s) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);

    return s
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        + "-" + randomNumber;
}