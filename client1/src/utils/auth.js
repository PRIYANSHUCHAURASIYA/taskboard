// Decodes a JWT payload without verifying the signature.

// Safe for reading non-sensitive claims client-side (e.g. user id),

// since the actual security check always happens server-side via authMiddleware.

export function getCurrentUserId() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const payloadBase64 = token.split(".")[1];
        // JWT uses base64url encoding — convert to standard base64 first
        const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = JSON.parse(atob(base64));
        return decoded.id || null;
    } catch (err) {
        return null;
    }
}
