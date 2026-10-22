"use client";

import Image from "next/image";

const iconMap = {
  add: "/add.png",
  edit: "/edit.png",
  insights: "/bar_chart.png",
  notifications: "/notifications.png",
  delete: "/delete.png",
};

const CustomButton = ({ onClick, imgSource, text }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-auto items-center justify-center rounded-[20px] border border-[#1F2F98] bg-[#F3F3F3]"
    >
      <div className="flex items-center justify-center gap-[10px]">
        {imgSource && iconMap[imgSource] && (
          <Image
            src={iconMap[imgSource]}
            alt=""
            width={30}
            height={30}
            className="h-[25px] w-[25px] object-contain"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(14%) sepia(45%) saturate(4000%) hue-rotate(218deg) brightness(85%) contrast(110%)",
            }}
          />
        )}

        <span className="text-base font-medium tracking-[1.6px] text-[#1F2F98]">
          {text}
        </span>
      </div>
    </button>
  );
};

export default CustomButton;