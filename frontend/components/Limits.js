const Limits = ({ week, month }) => {
    return (
        <div className="flex md:w-1/2 w-auto items-center justify-around rounded-[20px] bg-[#1F2F98] p-[10px]">
            <div className="flex items-center justify-between">
                <img
                    src="/lightbulb.png"
                    alt=""
                    className="mr-[10px] h-10 w-10 object-contain"
                />

                <div className="flex flex-col">
                    <p className="text-base font-semibold tracking-[0.6px] text-white  ">
                        Weekly limit
                    </p>
                    <p className="text-base font-bold tracking-[0.8px] text-white">
                        {week ?? 0} kWh
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <img
                    src="/lightbulb.png"
                    alt=""
                    className="mr-[10px] h-10 w-10 object-contain"
                />

                <div className="flex flex-col">
                    <p className="text-base font-semibold tracking-[0.6px] text-white  ">
                        Monthly limit
                    </p>
                    <p className="text-base font-bold tracking-[0.8px] text-white  ">
                        {month ?? 0} kWh
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Limits;