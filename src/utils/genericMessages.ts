export const GenericMessages = {
    // Auth Messages
    USER_CREATED: "If user with that email doesn't exist already, we have sent you an email verification link!",
    USER_ALREADY_EXISTS: "If user with that email doesn't exist already, we have sent you an email verification link!",
    LOGIN_SUCCESSFUL: "Logged in successfully!",
    LOGOUT_SUCCESSFUL: "Logged out successfully!",
    USER_VERIFIED: "User is successfully verified. Now you can login!",
    USER_DOESNT_EXIST: "If user with this email exists, we have sent a verification email!",
    USER_NOT_FOUND: "User not found!",

    ACCOUNT_NOT_VERIFIED_RESENT: "Email not verified. A new verification email has been sent.",
    ACCOUNT_NOT_VERIFIED_RATE_LIMIT: "Email not verified. Please wait 5 minutes before requesting another verification email.",
    ACCOUNT_NOT_VERIFIED_FAILED: "Email not verified. Failed to resend verification email.",

    ERROR_CHECKING_USER_EXISTENCE: "There was an error checking user existence. Please try again!",
    ERROR_FINDING_USER: "We couldn't find user after registration!",
    ERROR_REGISTER_VERIFICATION_TOKEN_EXPIRED: "This verification link has expired. Please request new one by trying to login again!",
    
    FAILED_REGISTRATION: "Failed to register user. Please try again!",
    FAILED_TO_GET_ID: "Failed to retrieve user ID",
    FAILED_TO_CREATE_VERIFICATION_TOKEN: "Failed to create verification token!",
    FAILED_TO_VERIFY_USER: "Failed to verify user. Please try again!",

    INVALID_LOGIN: "Invalid login credentials. Please try again.",
    INVALID_REGISTER: "Registration failed. Please check your information and try again.",
    INVALID_LOGOUT: "An error occurred during logout. Please try again.",
    INVALID_REGISTER_VERIFICATION_TOKEN: "Invalid verification link!",

    // JWT Messages
    INVALID_JWT_TOKEN: "Invalid authentication token. Please log in again.",
    NO_JWT_FOUND: "No authentication token found. Please log in.",
    JWT_DECODE_ERROR: "Error processing authentication token. Please log in again.",
    JWT_VERIFIED: "Authentication token successfully verified.",
    JWT_EXPIRED: "Your session has expired. Please log in again!",
    JWT_REFRESHED: "Authentication token successfully refreshed!",
    JWT_INVALID_DATA: "Invalid authentication token data!",

    // Refresh Token Messages
    REFRESH_TOKEN_NOT_FOUND: "Refresh token is not found!",
    REFRESH_TOKEN_INVALID: "Refresh token is invalid!",
    SESSION_EXPIRED: "Your session has expired. Please log in again!",

    // CSRF Token Messages
    CSRF_TOKEN_GENERATED: "CSRF Token generated successfully!",
    MISSING_CSRF_TOKEN: "Missing CSRF token",
    FAILED_TO_GET_CSRF_TOKEN: "Failed to get CSRF Token!",

    // Password Reset
    PASSWORD_RESET_REQUEST_FAILED: "Failed to request password reset. Please try again later.",
    PASSWORD_RESET_LINK_SENT: "If an account exists for that email, we have sent a password reset link.",
    PASSWORD_RESET_FAILED: "Failed to reset password. The link may be invalid or expired. Please request a new password reset.",
    PASSWORD_RESET_SUCCESS: "Your password has been successfully reset. You can now log in with your new password.",
    PASSWORD_RESET_TOKEN_GENERATED: "Successfully generated reset password token!",
    INVALID_RESET_PASSWORD_TOKEN: "Reset password link is invalid or expired",
    RESET_PASSWORD_TOKEN_VALID: "Reset password link is valid",
    PASSWORD_RESET_RATE_LIMITED: "Please wait 5 minutes before requesting another password reset",

    // Email Errors
    REGISTER_VERIFICATION_TOKEN_EMAIL_SENT: "Verification email sent successfully. Please check your email!",
    REGISTER_VERIFICATION_EMAIL_FAILED: "Failed to send verification email. Please try again later.",

    // Home Page Messages
    MATCH_DELETION_FAILED: "Failed to delete match. Please try again!",

    // Add Match Page Messages
    MATCH_CREATION_FAILED: "Failed to create a match. Please try again!",

    // Add Debt Page Messages
    DEBT_CREATION_FAILED: "Failed to add debt. Please try again!",

    // Add Location Page Messages
    LOCATION_CREATION_FAILED: "Failed to add location. Please try again!",

    // Edit Match Page Messages
    MATCH_EDIT_FAILED: "Failed to edit match. Please try again!",

    // Redis Messages
    REDIS_CONNECTION_ERROR: "Unable to connect to the database. Please try again later.",
    REDIS_DISCONNECTION_ERROR: "Error occurred while disconnecting from the database.",
    REDIS_GET_ERROR: "Unable to retrieve data from the cache. Please try again.",
    REDIS_SET_ERROR: "Unable to store data in the cache. Please try again.",
    REDIS_DELETE_ERROR: "Unable to delete data from the cache. Please try again.",
    REDIS_SCAN_ERROR: "Unable to scan data from the cache. Please try again.",
    REDIS_CLIENT_ERROR: "An error occurred with the database client. Please try again later.",

    // Rate Limit Messages
    RATE_LIMIT_EXCEEDED: "Too many requests, please try again in a minute!",
    LOGIN_RATE_LIMIT: "Too many login attempts, please try again after a minute",
    REGISTER_RATE_LIMIT: "Too many registration attempts, please try again after a minute",
    VERIFY_EMAIL_RATE_LIMIT: "Too many verification attempts, please try again after a minute",

    // General Messages
    IP_UNKNOWN: "Unable to determine IP",
    NETWORK_ERROR: "A network error occurred. Please check your connection and try again.",
    UNKNOWN_ERROR: "An unexpected error occurred. Please try again later.",
    INVALID_SERVER_RESPONSE: "Invalid response from server",
    DATABASE_ERROR: 'Database error occurred',
    API_CALL_ERROR: "There was an error calling API!",
    UNAUTHORIZED: "You are forbidden to do this. Please try to refresh the page or relog.",
};