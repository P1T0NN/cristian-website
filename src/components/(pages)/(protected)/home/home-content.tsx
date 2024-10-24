// TYPES
import type { typesUser } from "@/types/typesUser";

type HomeContentProps = {
    serverUserData: typesUser;
}

export const HomeContent = ({ 
    serverUserData 
}: HomeContentProps) => {
    return (
        <section>
            <div>
                <h1>Welcome, {serverUserData.email}!</h1>
            </div>
        </section>
    );
}