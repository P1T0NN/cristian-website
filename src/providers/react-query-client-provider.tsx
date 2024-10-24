"use client"

// REACTJS IMPORTS
import React from "react";

// LIBRARIES
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const ReactQueryClientProvider = ({ 
    children 
}: { 
    children: React.ReactNode 
}) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}