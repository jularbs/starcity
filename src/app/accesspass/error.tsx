'use client' // Error boundaries must be Client Components

export default function Error() {

    return (
        <div className="text-center pt-8 px-3">
            <h2 className="text-xl font-bold uppercase">Transaction Invalid</h2>
        </div>
    )
}