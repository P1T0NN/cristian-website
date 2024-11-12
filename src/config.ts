export const GLOBAL_RATE_LIMIT = 1000;

export const PAGE_ENDPOINTS = {
    LOGIN_PAGE:             "/login",
    REGISTER_PAGE:          "/register",
    FORGOT_PASSWORD_PAGE:   "/forgot_password",
    VERIFY_EMAIL_PAGE:      "/verify_email",
    RESET_PASSWORD_PAGE:    "/reset_password",

    // PROTECTED PAGES (JWT REQUIRED)

    HOME_PAGE:              "/home",
    SETTINGS_PAGE:          "/settings",
    MATCH_PAGE:             "/match",

    // ADMIN PROTECTED PAGES (JWT REQUIRED AND isAdmin TO TRUE)

    ADD_MATCH_PAGE:         "/add_match",
    ADD_DEBT_PAGE:          "/add_debt",
    ADD_LOCATION_PAGE:      "/add_location",
    EDIT_MATCH_PAGE:        "/edit_match",
    PLAYER_PAGE:            "/player",
    ADD_TEAM_PAGE:          "/add_team",
    TEAM_PAGE:              "/team",
    MATCH_HISTORY:          "/match_history"
}

export const CACHE_KEYS = {
    MATCH_PREFIX:           "match:",
    USER_PREFIX:            "user:",
    ALL_LOCATIONS_PREFIX:   "all_locations",
    ALL_TEAMS_PREFIX:       "all_teams"
}