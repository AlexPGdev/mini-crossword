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

interface HomeProps {
  streaks: any[];
}

function HomeContent({ streaks }: HomeProps) {
  const searchParams = useSearchParams();
  const [isPuzzleActive, setIsPuzzleActive] = useState(true);

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
            <MiniCrossword onHomeClick={handleHomeClick} />
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
  const [streaks, setStreaks] = useState<any[]>([]);

  useEffect(() => {
    document.title = "Mini Crossword"
  }, [])

  useEffect(() => {
      fetch('/streaks.json')
          .then(response => response.json())
          .then(data => {
              const sortedData = [...data.streakInfo].sort((a, b) => {
                  const aDate = new Date(a.puzzleDetails.publicationTime);
                  const bDate = new Date(b.puzzleDetails.publicationTime);

                  if (aDate.getFullYear() !== bDate.getFullYear()) {
                      return bDate.getFullYear() - aDate.getFullYear();
                  }
                  if (aDate.getMonth() !== bDate.getMonth()) {
                      return bDate.getMonth() - aDate.getMonth();
                  }
                  return aDate.getDate() - bDate.getDate();
              });

              setStreaks(sortedData);
          })
          .catch(error => {
              console.error('Error fetching streaks:', error);
          });
  }, [])

  return (
    <div className="flex min-h-screen bg-zinc-900 font-sans py-4 sm:py-5 flex-col gap-y-4 px-4 sm:px-6 md:px-10 lg:px-[12%] justify-between">
      <div className="flex flex-col w-full h-full gap-y-2 pb-20">
        <Header />
        <Stats streaks={streaks} />
        <ProgressBar streaks={streaks} />

        <>
          <Suspense fallback={<div className="flex min-h-screen bg-zinc-900 font-sans py-5 flex-col gap-y-4"></div>}>
            <HomeContent streaks={streaks} />
          </Suspense>
        </>

      </div>

      <Footer />
    </div>
  );
}
