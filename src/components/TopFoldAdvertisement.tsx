'use client'
import dynamic from 'next/dynamic'
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const TopFoldAdvertisement = () => {

    return <>
        <ReactPlayer
            url='https://youtu.be/bGTCSyM2Zro'
            className="aspect-video z-0 -mt-navbar-height"
            loop={true}
            volume={0}
            muted={true}
            controls={false}
            playing={true}
            width="100%"
            height="100%" />
    </>
}

export default TopFoldAdvertisement;