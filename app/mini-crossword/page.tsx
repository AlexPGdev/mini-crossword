"use client";

import { Footer } from "./components/Footer";
import { useEffect, useState } from "react";
import { Stats } from "./components/Stats";
import { ProgressBar } from "./components/ProgressBar";
import { MiniCrossword } from "./components/MiniCrossword";
import { Header } from "./components/Header";
import { Calendar } from "./components/Calendar";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense } from "react";
import { SettingsProvider } from "./hooks/useSettings";
import { usePuzzles } from "./hooks/usePuzzles";

interface HomeProps {
  streaks: any[];
}

function HomeContent({ streaks }: HomeProps) {
  const searchParams = useSearchParams();
  const [isPuzzleActive, setIsPuzzleActive] = useState(false);
  const [allPuzzleIds, setAllPuzzleIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
      fetch("/api/user")
        .then(res => res.json())
        .then(user => {
          setUserId(user.id);
        });

    fetch("/api/puzzles/ids")
        .then(res => res.json())
        .then((ids: string[]) => setAllPuzzleIds(ids));
  }, []);

  useEffect(() => {
    const pressed = searchParams.get("crossword");
    setIsPuzzleActive(!!pressed);
  }, [searchParams]);

  const handleHomeClick = () => {
    setIsPuzzleActive(!isPuzzleActive);
  }

  return (
    <SettingsProvider>
      <AnimatePresence mode="wait">
        {isPuzzleActive ? (
          <motion.div
            key="crossword"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <MiniCrossword onHomeClick={handleHomeClick} allPuzzleIds={allPuzzleIds} userId={userId} />
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Calendar onTileClick={handleHomeClick} streaks={streaks} />
          </motion.div>
        )}
      </AnimatePresence>
    </SettingsProvider>
  )
}

export default function Home() {
  // const [streaks, setStreaks] = useState<any[]>([]);
  const { loadPuzzles, puzzles, stats } = usePuzzles();


  const handleLogin = (token: string) => {
    fetch("/api/user", {
      method: "POST",
      body: JSON.stringify({ token }),
      headers: {
        "Content-Type": "application/json"
      }
    }).finally(() => {
      window.location.reload();
    });
  }
  
  useEffect(() => {
    document.title = "Mini Crossword"
    loadPuzzles();
  }, [])

  return (
    <div className="flex min-h-screen bg-zinc-900 font-sans py-4 sm:py-5 flex-col gap-y-4 px-4 sm:px-6 md:px-10 lg:px-[10%] justify-between">
      <div className="flex flex-col w-full h-full gap-y-2 pb-20">
        <Header onLogin={handleLogin} />
        <Stats stats={stats} />
        <ProgressBar streaks={puzzles} />

        <>
          <Suspense fallback={<div className="flex min-h-screen bg-zinc-900 font-sans py-5 flex-col gap-y-4"></div>}>
            <HomeContent streaks={puzzles} />
          </Suspense>
        </>

      </div>

      <Footer />
    </div>
  );
}
