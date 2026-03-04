/**
 * Gets or creates a persistent session ID for anonymous user actions (likes/saves).
 * This allows us to track social interactions in the database without a formal login.
 */
export function getSessionId(): string {
    if (typeof window === 'undefined') return '';

    let sessionId = localStorage.getItem('travel_session_id');

    if (!sessionId) {
        // Generate a simple unique ID
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem('travel_session_id', sessionId);
    }

    return sessionId;
}
