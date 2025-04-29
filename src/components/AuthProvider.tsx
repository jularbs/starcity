'use client';
import { redirect } from "next/navigation";
import { validateToken } from "@/actions/auth";
import { getCookie } from 'typescript-cookie'
import { useEffect, useState } from "react";

export function AuthProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        console.log("Auth checking...")
        const token = getCookie('token');
        validateToken(token).then(data => {
            if (data) {
                setAuthenticated(true)
            } else {
                redirect("/auth/login")
            }
        }).catch(() => {
            redirect("/auth/login")
        })
    }, [])

    if (authenticated)
        return <>{children}</>
}