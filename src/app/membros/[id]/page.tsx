"use client";
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function MembroPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    useEffect(() => {
        if (id) {
            router.replace(`/membros/${id}/detalhes`);
        }
    }, [id, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );
}
