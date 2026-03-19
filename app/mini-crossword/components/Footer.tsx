"use client"

import { memo } from "react"

export const Footer = memo(function Footer() {
    return (
        <footer className="text-center pt-10 bottom-10 w-full">
            Made with <span style={{ background: 'linear-gradient(135deg, #36ff00, #0f3f00)', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textDecoration: '' }}>❤️</span> by <a href="https://github.com/AlexPGdev" target="_blank" style={{ color: "white", textDecoration: 'underline' }}>AlexPG</a>
        </footer>
    )
})