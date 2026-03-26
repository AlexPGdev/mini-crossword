
export default function Home() {
  return (
    <div className='p-10 justify-center items-center flex flex-col gap-y-10'>
        <img src='/peepoHey.gif' className='w-32 h-32' />
        <h1 className='text-4xl'>AlexPG.</h1>

        <h2 className='text-2xl'>Check out my projects!</h2>

        <div className='flex justify-between items-center gap-x-10 text-center'>
            <div className='flex flex-col gap-y-4 max-w-sm'>
                <div>
                    <h3 className='text-xl'>Mini Crossword</h3>
                    <p className='text-sm'>A mini crossword game</p>
                </div>
                
                <a href='/mini-crossword' className='hover:scale-105 transition-all'>
                    <img src='/cw.png' className='rounded-xl'></img>
                </a>
            </div>
        </div>
    </div>
  );
}