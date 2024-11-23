export const GLOBAL_RATE_LIMIT = 1000;
export const DEFAULT_JWT_EXPIRATION_TIME = 30 * 60; // 30 minutes default
export const DEFAULT_REFRESH_TOKEN_EXPIRATION_TIME = 7 * 24 * 60 * 60; // 7 days

export const CACHE_KEYS = {
    MATCH_PREFIX:           "match:",
    USER_PREFIX:            "user:",
    ALL_LOCATIONS_PREFIX:   "all_locations",
    ALL_TEAMS_PREFIX:       "all_teams"
}

export const PUBLIC_PAGE_ENDPOINTS = {
    LOGIN_PAGE: "/login",
    REGISTER_PAGE: "/register",
    FORGOT_PASSWORD_PAGE: "/forgot_password",
    VERIFY_EMAIL_PAGE: "/verify_email",
    RESET_PASSWORD_PAGE: "/reset_password",
};

export const PROTECTED_PAGE_ENDPOINTS = {
    HOME_PAGE: "/home",
    SETTINGS_PAGE: "/settings",
    MATCH_PAGE: "/match",
    ACTIVE_MATCHES: "/active_matches",
    PLAYER_PAGE: "/player",
};

export const ADMIN_PAGE_ENDPOINTS = {
    ADD_MATCH_PAGE: "/add_match",
    ADD_DEBT_PAGE: "/add_debt",
    ADD_LOCATION_PAGE: "/add_location",
    EDIT_MATCH_PAGE: "/edit_match",
    ADD_TEAM_PAGE: "/add_team",
    TEAM_PAGE: "/team",
    MATCH_HISTORY: "/match_history",
};

// Helper function to get all protected routes
export const getAllProtectedRoutes = () => {
    return [
        ...Object.values(PROTECTED_PAGE_ENDPOINTS),
        ...Object.values(ADMIN_PAGE_ENDPOINTS)
    ];
};