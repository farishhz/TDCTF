"use client"

import React from 'react'
import { cn } from '@/shared/lib/utils'

interface BrandLogoProps {
    name: string
    className?: string
}

const BrandLogo = ({ name = "", className }: BrandLogoProps) => {
    const isCtfBrand = name.toUpperCase().endsWith("CTF");

    if (isCtfBrand) {
        const prefix = name.substring(0, name.length - 3);
        const suffix = name.substring(name.length - 3);

        return (
            <span className={cn("inline-flex items-center font-black tracking-tighter select-none group", className)}>
                <span className="text-gray-900 dark:text-white transition-colors">
                    {prefix}
                </span>
                <span className="relative ml-0.5 inline-block transition-transform duration-300 group-hover:scale-105">
                    <span className="bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400 bg-clip-text text-transparent animate-shimmer-slow drop-shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:drop-shadow-[0_0_16px_rgba(59,130,246,0.6)]">
                        {suffix}
                    </span>
                </span>
            </span>
        );
    }

    return (
        <span className={cn("bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-400 dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400 bg-clip-text text-transparent animate-shimmer-slow font-black tracking-tighter", className)}>
            {name}
        </span>
    );
};

BrandLogo.displayName = "BrandLogo";
export default BrandLogo;
