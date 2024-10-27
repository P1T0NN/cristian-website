export const PAGE_ENDPOINTS = {
    LOGIN_PAGE:             "/login",
    REGISTER_PAGE:          "/register",
    FORGOT_PASSWORD_PAGE:   "/forgot_password",

    // PROTECTED PAGES (JWT REQUIRED)

    HOME_PAGE:              "/home",
    SETTINGS_PAGE:          "/settings",
    MATCH_PAGE:             "/match",

    // ADMIN PROTECTED PAGES (JWT REQUIRED AND isAdmin TO TRUE)

    ADD_MATCH_PAGE:         "/add_match",
    ADD_DEBT_PAGE:          "/add_debt",
    ADD_LOCATION_PAGE:      "/add_location",
    EDIT_MATCH_PAGE:        "/edit_match"
}