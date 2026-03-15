import React from 'react';

const Cards = () => {
    const [stopScroll, setStopScroll] = React.useState(false);
    const cardData = [
        {
            title: "Unlock Your Creative Flow",
            image: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754244559/Bycycle_oyeesu.png",
        },
        {
            title: "Design Your Digital Future",
            image: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754244399/induction_cnkdrh.png",
        },
        {
            title: "Build with Passion, Ship with Pride",
            image: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754244397/utensils_jmyj8b.png",
        },
        {
            title: "Think Big, Code Smart",
            image: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754244395/Laptop_2_hug9gx.png",
        },
    ];

    return (
        <>
            <style>{`
                .marquee-inner {
                    animation: marqueeScroll linear infinite;
                }

                @keyframes marqueeScroll {
                    0% {
                        transform: translateX(0%);
                    }

                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}</style>

            <div className=" my-7 overflow-hidden w-full relative max-w-7xl mx-auto" onMouseEnter={() => setStopScroll(true)} onMouseLeave={() => setStopScroll(false)}>
                <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
                <div className="marquee-inner flex w-fit" style={{ animationPlayState: stopScroll ? "paused" : "running", animationDuration: cardData.length * 2500 + "ms" }}>
                    <div className="flex">
                        {[...cardData, ...cardData].map((card, index) => (
                            <div key={index} className="w-70 mx-4 h-[20rem] relative group hover:scale-90 transition-all duration-300 rounded">
                                <img src={card.image} alt="card" className="w-full h-full object-cover rounded" />
                                <div className=" flex items-center justify-center px-4 opacity-0 group-hover:opacity-100 transition-all duration-300 absolute bottom-0 backdrop-blur-md left-0 w-full h-full bg-black/20">
                                    <p className="text-white text-lg font-semibold text-center">{card.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
            </div>
        </>
    );
};

export default Cards;