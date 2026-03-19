"use client";

import { HomeIcon } from "lucide-react";
import Image from "next/image";
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

interface HomeProps {
  grid: any;
  streaks: any[];
}

function HomeContent({ grid, streaks }: HomeProps) {
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
    <AnimatePresence mode="wait">
      {isPuzzleActive ? (
        <motion.div
          key="crossword"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <MiniCrossword grid={grid} onHomeClick={handleHomeClick} />
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
  )
}

export default function Home() {
  const [streaks, setStreaks] = useState<any[]>([]);

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


  let grid = {
    size: 5,
    layout: [
      0, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
      1, 1, 1, 1, 0,
      1, 1, 1, 0, 0
    ],
    clues: {
      "across": ["Clue 1", "Clue 2", "Clue 3", "Clue 4", "Clue 5"], 
      "down": ["Clue 1", "Clue 2", "Clue 3", "Clue 4", "Clue 5"]
    },
    solution: [
      "", "T", "E", "S", "T",
      "T", "I", "G", "E", "R",
      "M", "E", "O", "W", "!",
      "C", "L", "U", "E", "",
      "W", "O", "O", "", ""
    ]
  }

  return (
    <div className="flex min-h-screen bg-zinc-900 font-sans py-5 px-[12%] flex-col gap-y-4">
      <Header />

      <div className="flex flex-col w-full h-full gap-y-2 pb-20">
        <Stats />
        <ProgressBar />

        <>
          <Suspense fallback={<div className="flex min-h-screen bg-zinc-900 font-sans py-5 px-[12%] flex-col gap-y-4"></div>}>
            <HomeContent grid={grid} streaks={streaks} />
          </Suspense>
        </>

      </div>

      <Footer />
    </div>
  );
}
