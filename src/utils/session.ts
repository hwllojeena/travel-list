/**
 * Gets or creates a persistent session ID for anonymous user actions (likes/saves).
 * This allows us to track social interactions in the database without a formal login.
 * 
 * IMPORTANT: We use a proper UUID format to ensure compatibility with Supabase UUID columns.
 */
export function getSessionId(): string {
    if (typeof window === 'undefined') return '';

    let sessionId = localStorage.getItem('travel_session_id');

    // Basic UUID v4-like generator for compatibility
    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    if (!sessionId || sessionId.startsWith('sess_')) {
        // Generate a proper UUID
        sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : generateUUID();
        localStorage.setItem('travel_session_id', sessionId);
    }

    return sessionId;
}
