import { ConstructionIcon } from "lucide-react";

const UnderConstrution = () => {
    return <div className="flex justify-center items-center">
        <div className="w-full h-200 bg-accent animate-pulse rounded-md p-4">
        </div>
        <div className="absolute text-xl font-bold text-center flex flex-col justify-center items-center">
            <ConstructionIcon size={80} className="mb-1" />
            <span>This page is still under construction</span>
            <span className="text-sm font-light">Developer will give an update once page is ready</span>
        </div>
    </div>

}

export default UnderConstrution;