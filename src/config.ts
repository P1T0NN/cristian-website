export const PAGE_ENDPOINTS = {
    LOGIN_PAGE:             "/login",
    REGISTER_PAGE:          "/register",
    FORGOT_PASSWORD_PAGE:   "/forgot_password",

    // PROTECTED PAGES (JWT REQUIRED)

    HOME_PAGE:              "/home",
    SETTINGS_PAGE:          "/settings",

    // ADMIN PROTECTED PAGES (JWT REQUIRED AND isAdmin TO TRUE)

    ADD_MATCH_PAGE:         "/add_match"
}