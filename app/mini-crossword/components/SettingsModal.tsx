import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useSettings } from "../hooks/useSettings";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
    const { settings, saveSettings } = useSettings();

    const [animationsEnabled, setAnimationsEnabled] = useState(settings.animationsEnabled);
    const [cursiveFont, setCursiveFont] = useState(settings.cursiveFont);

    useEffect(() => {
        setAnimationsEnabled(settings.animationsEnabled);
        setCursiveFont(settings.cursiveFont);
    }, [settings]);

    const handleAnimationsEnabled = (enabled: boolean) => {
        saveSettings({ ...settings, animationsEnabled: enabled });
    };

    const handleCursiveFont = (enabled: boolean) => {
        saveSettings({ ...settings, cursiveFont: enabled });
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="backdrop"
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />

                    <motion.div
                        key="modal"
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    >
                        <motion.div
                            className="relative w-full max-w-sm rounded-2xl bg-zinc-700 p-6 shadow-xl"
                            initial={{ opacity: 0, y: 20, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.5 }}
                            transition={{ duration: 0.25 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 right-0 p-2">
                                <button
                                    type="button"
                                    className="rounded-full p-1 text-zinc-400 hover:text-zinc-200"
                                    onClick={onClose}
                                >
                                    <XIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <h3 className="text-lg text-zinc-200 text-center mb-4">Settings</h3>

                            <div className="flex justify-center items-center">
                                <div className="flex flex-col gap-4 w-3/4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-zinc-200 tracking-wide">Tile Animations</label>
                                        <button
                                            type="button"
                                            onClick={() => handleAnimationsEnabled(!animationsEnabled)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${animationsEnabled ? "bg-green-500" : "bg-zinc-400"
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${animationsEnabled ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="text-zinc-200 tracking-wide">Cursive Font</label>
                                        <button
                                            type="button"
                                            onClick={() => handleCursiveFont(!cursiveFont)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cursiveFont ? "bg-green-500" : "bg-zinc-400"
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cursiveFont ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}