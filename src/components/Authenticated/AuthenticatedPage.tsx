import IAuthenticatedPageProps from "@/components/Authenticated/interface/AuthenticatedPageProps";
import {useAuth} from "@/resources/users/authentication.resourse";
import React, {useEffect} from "react";
import {useRouter} from "next/navigation";

const AuthenticatedPage: React.FC<IAuthenticatedPageProps> = ({children}) => {
    const auth = (useAuth());
    const router = useRouter();

    useEffect(() => {
        if (!auth.isSessionValid()) {
            router.replace("/");
        }
    }, [auth, router]);

    if (!auth.isSessionValid()) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div role="status">
                    <svg className="animate-spin h-8 w-8 text-[var(--primary)]" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-20" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <span className="select-none sr-only">Carregando...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {children}
        </>
    );
}

export default React.memo(AuthenticatedPage);
