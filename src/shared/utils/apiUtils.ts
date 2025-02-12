// LIBRARIES
import { getTranslations } from "next-intl/server";

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

interface ApiResponse<T> {
    success: boolean
    message?: string
    data?: T
}

interface RequestOptions {
    endpoint: string
    method?: "GET" | "POST" | "PUT" | "DELETE"
    skipAuth?: boolean
    queryParams?: Record<string, string>
    body?: unknown
    tags?: string[]
    successMessage?: string
    errorMessages?: {
        unauthorized?: string
        requestFailed?: string
        serverError?: string
        notFound?: string
    }
    cache?: RequestCache
    next?: { tags: string[] }
    debug?: boolean // New debug flag
}

export async function apiRequest<T>({
    endpoint,
    method = "GET",
    skipAuth = false,
    queryParams = {},
    body,
    tags = [],
    successMessage,
    errorMessages = {},
    cache,
    next,
    debug = false, // Default to false
}: RequestOptions): Promise<ApiResponse<T>> {
    const t = await getTranslations("GenericMessages")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const log = (message: string, data?: any) => {
        if (debug) {
            console.log(`[apiRequest] ${message}`, data)
        }
    }

    log("Starting request:", {
        endpoint,
        method,
        queryParams,
        hasTags: tags.length > 0,
        hasCache: !!cache,
    })

    if (!skipAuth) {
        const { isAuth } = await verifyAuth()

        if (!isAuth) {
            log("Auth failed: No session")
            return {
                success: false,
                message: errorMessages.unauthorized || t("UNAUTHORIZED"),
            }
        }
    }

    // Construct URL with query parameters
    const queryString = new URLSearchParams(queryParams).toString()
    const url = `${process.env.NEXT_PUBLIC_FRONTEND_URL}${endpoint}${queryString ? `?${queryString}` : ""}`

    log("Constructed URL:", url)

    const fetchOptions: RequestInit = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        ...(cache && { cache }),
        ...(next && { next }),
    }

    const response = await fetch(url, fetchOptions)

    log("Response status:", {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
    })

    if (!response.ok) {
        log("Request failed:", {
            status: response.status,
            statusText: response.statusText,
        })

        if (response.status === 401) {
            return {
                success: false,
                message: errorMessages.unauthorized || t("UNAUTHORIZED"),
            }
        }

        if (response.status === 404) {
            return {
                success: false,
                message: errorMessages.notFound || t("NOT_FOUND"),
            }
        }
        return {
            success: false,
            message: errorMessages.requestFailed || t("INTERNAL_SERVER_ERROR"),
        }
    }

    const data = await response.json()

    log("Response data:", {
        hasData: !!data,
        hasErrors: !!data.errors,
    })

    if (data.errors) {
        return {
            success: false,
            message: errorMessages.serverError || t("INTERNAL_SERVER_ERROR"),
        }
    }

    return {
        success: true,
        message: successMessage,
        data: data,
    }
}