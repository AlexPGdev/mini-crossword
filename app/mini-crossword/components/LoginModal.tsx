"use client"

import { XIcon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginModalProps {
    open: boolean;
    onClose: () => void;
    onApply: (token: string) => void;
}

export function LoginModal({ open, onClose, onApply }: LoginModalProps) {
    const [token, setToken] = useState("");

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
                            className="relative w-full max-w-sm rounded-2xl bg-zinc-800/80 backdrop-blur-sm p-6 shadow-inner shadow-zinc-200/30"
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

                            <h3 className="text-lg text-zinc-200 text-center mb-4">Login</h3>
                            
                            {/* <label className="text-zinc-200 tracking-wide">Token</label> */}

                            <div className="flex gap-2">
                                <input 
                                    className="w-full min-h-[40px] bg-zinc-700/80 rounded-full text-sm text-zinc-300 p-2 px-6 focus:outline-1 focus:outline-zinc-400 min-w-0 shadow-inner shadow-zinc-200/30 hover:bg-zinc-600 hover:shadow-zinc-300/30 transition-all" 
                                    type="text" 
                                    placeholder="Enter token"
                                    onChange={(e) => setToken(e.target.value)}
                                    value={token}
                                />
                                <button 
                                    className="flex bg-zinc-600/30 cursor-pointer hover:bg-zinc-600 active:bg-zinc-500 rounded-full shadow-inner shadow-zinc-200/30 transition-all items-center" 
                                    type="button" 
                                    onClick={() => onApply(token)}
                                >
                                    <span className="p-1.5 px-2 sm:p-2 sm:px-4 text-sm sm:text-base">Apply</span>
                                </button>
                            </div>


                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}