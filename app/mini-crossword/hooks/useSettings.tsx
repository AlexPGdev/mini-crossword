"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface Settings {
    animationsEnabled: boolean;
    cursiveFont: boolean;
}

interface SettingsContextType {
    settings: Settings;
    saveSettings: (newSettings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>({
        animationsEnabled: true,
        cursiveFont: true,
    });

    useEffect(() => {
        const saved = localStorage.getItem("settings");
        if (saved) {
            setSettings(JSON.parse(saved));
        }
    }, []);

    const saveSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        localStorage.setItem("settings", JSON.stringify(newSettings));
    };

    return (
        <SettingsContext.Provider value={{ settings, saveSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used inside SettingsProvider");
    }
    return context;
}