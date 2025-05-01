import { cn } from "@/lib/utils";
import Image from 'next/image';

export function ImageComponent({
    media,
    className,
    width,
    height,
    src,
    alt
}: {
    media?: Record<string, string | undefined>,
    className?: string,
    width: number,
    height: number,
    src: string,
    alt: string
}) {

    const getSource = () => {

        if (media?.key && media?.bucket) {
            return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/media?key=${media.key}&bucket=${media.bucket}`;
        }

        if (media?.key) {
            return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/media?key=${media.key}`;
        }

        return src;
    }

    return (
        <Image className={cn("", className)}
            alt={alt}
            width={width}
            height={height}
            src={getSource()} />
    );
}
