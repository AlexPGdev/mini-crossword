import { HomeIcon } from "lucide-react";
import Image from "next/image";
import { Footer } from "../components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-zinc-900 font-sans py-5 px-[20%] flex-col gap-y-4">
      <div className="flex flex-col border-b-2 h-full border-zinc-800  w-full pb-2">
        <h1 className="text-5xl font-extrabold tracking-wide">Mini <span className="text-green-600 italic font-[cursive]">Crossword</span></h1>
      </div>

      <div className="flex flex-col w-full h-full gap-y-2">
        <div className="flex bg-zinc-800 w-full border-1 border-zinc-600 rounded-2xl justify-between">
          <div className="flex flex-col w-1/4 items-center border-r-2 border-zinc-600 p-2">
            <p className="text-sm text-zinc-300 uppercase">Completed</p>
            <p className="text-2xl text-green-600 font-bold italic">102</p>
            <p className="text-sm text-zinc-400">of 748 total</p>
          </div>
          <div className="flex flex-col w-1/4 items-center border-r-2 border-zinc-600 p-2">
            <p className="text-sm text-zinc-300 uppercase">Completetion Rate</p>
            <p className="text-2xl text-green-600 font-bold italic">13.64%</p>
            <p className="text-sm text-zinc-400">overall</p>
          </div>
          <div className="flex flex-col w-1/4 items-center border-r-2 border-zinc-600 p-2">
            <p className="text-sm text-zinc-300 uppercase">Avg Time</p>
            <p className="text-2xl text-green-600 font-bold italic">4:21</p>
            <p className="text-sm text-zinc-400">per puzzle</p>
          </div>
          <div className="flex flex-col w-1/4 items-center p-2">
            <p className="text-sm text-zinc-300 uppercase">Best Time</p>
            <p className="text-2xl text-green-600 font-bold italic">0:20</p>
            <p className="text-sm text-zinc-400">Mar 10, 2026</p>
          </div>
        </div>

        <div className="flex flex-col bg-zinc-800 w-full border-1 border-zinc-600 rounded-2xl justify-between px-5 py-2">
          <div className="flex justify-between w-full">
            <p className="text-sm text-zinc-300 uppercase">Progress To Completion</p>
            <p className="text-sm text-zinc-300 uppercase"><span className="text-green-600">102</span> / 748</p>
          </div>
          <div className="flex w-full h-4 bg-zinc-600 rounded-full mt-2 overflow-hidden">
            <div className="flex h-full bg-green-600 text-center items-center justify-center" style={{ width: "13.64%" }}>
              <span className="text-sm text-zinc-200">100</span>
            </div>
            <div className="flex h-full bg-green-800 text-center items-center justify-center" style={{ width: "2%" }}>
              <span className="text-sm text-zinc-200">2</span>
            </div>
          </div>
          <div className="flex gap-x-6">
            <div className="flex items-center gap-x-2 mt-3 text-xs text-zinc-300">
              <div className=" w-2 h-2 bg-green-600 rounded-xs"></div>
              <p className="text-zinc-400">Completed</p>
            </div>
            <div className="flex items-center gap-x-2 mt-3 text-xs text-zinc-300">
              <div className=" w-2 h-2 bg-green-800 rounded-xs"></div>
              <p className="text-zinc-400">Completed Today</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-zinc-800 w-full border-1 border-zinc-600 rounded-2xl justify-between px-5 py-4 gap-y-5">
          <div className="flex justify-between border-b-2 border-zinc-600 pb-5">
            <div className="flex items-center">
              <HomeIcon className="h-[20px] w-fit pr-3 border-r-2 border-zinc-600 flex items-center justify-center cursor-pointer stroke-zinc-400 hover:stroke-zinc-100 transition-all" />
              <p className="font-bold pl-3 mr-5 h-[20px] w-fit pr-3 border-r-2 border-zinc-600 flex items-center justify-center">00:05</p>
              <button className="flex text-zinc-400 cursor-pointer hover:bg-zinc-600 rounded-sm hover:text-zinc-200 transition-all"><span className="p-2 px-4">Result</span></button>
              <button className="flex text-zinc-400 cursor-pointer hover:bg-zinc-600 rounded-sm hover:text-zinc-200 transition-all"><span className="p-2 px-4">Info</span></button>
            </div>
            <button className="flex text-zinc-400 mr-5 cursor-pointer hover:bg-zinc-600 rounded-sm hover:text-zinc-200 transition-all"><span className="p-2 px-4">Settings</span></button>
          </div>

          <div className="flex w-full gap-x-10">
            <div className="grid rounded-2xl overflow-hidden" style={{ gridTemplateColumns: 'repeat(5, 78px)', gridTemplateRows: 'repeat(5, 78px)' }}>
              <div className="w-20 h-20 bg-black border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700">
                <div className="flex h-full w-full items-center justify-center text-5xl">A</div>
              </div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-black border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-zinc-600 border-1 border-zinc-700"></div>
              <div className="w-20 h-20 bg-black border-1 border-zinc-700"></div>
            </div>
    
            <div className="flex flex-col gap-y-5">
              <div className="flex gap-x-60 border-b-1 border-zinc-600 pb-5">
                <div className="flex flex-col gap-y-1">
                  <p className="text-sm uppercase font-bold text-zinc-300 gap">Across</p>
                  <p className="text-sm text-zinc-300 ml-2"><span className="font-bold">1.</span> Clue 1</p>
                  <p className="text-sm text-zinc-300 ml-2"><span className="font-bold">2.</span> Clue 2</p>
                  <p className="text-sm text-zinc-300 ml-2"><span className="font-bold">3.</span> Clue 3</p>
                  <p className="text-sm text-zinc-300 ml-2"><span className="font-bold">4.</span> Clue 4</p>
                  <p className="text-sm text-zinc-300 ml-2"><span className="font-bold">5.</span> Clue 5</p>
                </div>
                <div className="flex flex-col gap-y-1">
                  <p className="text-sm uppercase font-bold text-zinc-300">Down</p>
                  <p className="text-sm text-zinc-300 ml-2"><span className="font-bold">1.</span> Clue 1</p>
                  <p className="text-sm text-zinc-300 ml-2"><span className="font-bold">2.</span> Clue 2</p>
                  <p className="text-sm text-zinc-300 ml-2"><span className="font-bold">3.</span> Clue 3</p>
                  <p className="text-sm text-zinc-300 ml-2"><span className="font-bold">4.</span> Clue 4</p>
                  <p className="text-sm text-zinc-300 ml-2"><span className="font-bold">5.</span> Clue 5</p>
                </div>
              </div>
              <div className="flex flex-col gap-y-2">
                <p className="text-sm uppercase font-bold text-zinc-300">Multiplayer</p>
                <button className="flex w-fit bg-green-600/33 rounded-lg border-1 border-green-600 text-center contents-center justify-center items-center cursor-pointer hover:bg-green-600 transition-all">
                  <span className="px-6 py-2 text-green-400 text-sm hover:text-green-100">+ Create Room</span>
                </button>
                <div className="flex gap-x-2 items-center h-[40px]">
                  <input className="w-full h-full bg-zinc-800 rounded-lg border-1 border-zinc-600 text-sm text-zinc-300 p-2 focus:outline-1 focus:outline-zinc-400" placeholder="Enter code" />
                  <button className="flex h-full rounded-lg border-1 border-zinc-600 text-center contents-center justify-center items-center cursor-pointer hover:bg-zinc-600 transition-all">
                    <span className="px-6 text-zinc-300 text-sm hover:text-zinc-200">Join</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
