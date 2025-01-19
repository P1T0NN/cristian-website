"use client"

// REACTJS IMPORTS
import { useState, useEffect } from "react";

// LIBRARIES
import { useTheme } from "next-themes";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";

// LUCIDE ICONS
import { Moon, Sun } from "lucide-react";

export const ToggleMode = () => {
    const { theme, setTheme } = useTheme();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <Button variant="secondary" size="icon" disabled={true}></Button>
    }

    const dark = theme === "dark"

    return (
        <Button 
            variant="secondary" 
            size="icon" 
            onClick={() => setTheme(`${dark ? "light" : "dark"}`)}
        >
            {dark ? (<Sun className="hover:cursor-pointer hover:text-primary" />) : (<Moon className="hover:cursor-pointer hover:text-primary" />)}
        </Button> 
    )
};