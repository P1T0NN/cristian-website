// COMPONENTS
import { ToggleMode } from "@/components/ui/toggle-mode/toggle-mode"

export const HeaderUnprotected = () => {
    return (
        <nav className="flex w-full py-4 px-10 justify-between bg-transparent">
            <h1 className="text-xl font-bold tracking-[2px]">Cris Futbol</h1>

            <ToggleMode />
        </nav>
    )
}