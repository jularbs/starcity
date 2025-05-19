export const createCheckout = async (checkoutDetails) => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/create-checkout`,
            {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(checkoutDetails)
            }
        );

        if (!res.ok) {
            return res.json().then((error) => {
                throw error;
            });
        }

        return res.json();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        throw {
            error: "Server error, please try again later",
        };
    }
};

export const getSaleDetails = async ({ refid, cache = { revalidate: 0 } }) => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/sale/${refid}`,
            {
                next: cache,
            }
        );

        if (!res.ok) {
            return res.json().then((error) => {
                throw error;
            });
        }

        return res.json();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        throw {
            error: "Server error, please try again later",
        };
    }
};


export const createDragonPayCheckout = async (checkoutDetails) => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/payment/dragonpay`,
            {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(checkoutDetails)
            }
        );

        if (!res.ok) {
            return res.json().then((error) => {
                throw error;
            });
        }

        return res.json();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        throw {
            error: "Server error, please try again later",
        };
    }
};

export const processPaypalPayment = async (data) => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_WEBHOOKS_ENDPOINT}/v1/paypal/process`,
            {
                method: "PUT",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
        );

        if (!res.ok) {
            return res.json().then((error) => {
                throw error;
            });
        }

        return res.json();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        throw {
            error: "Server error, please try again later",
        };
    }
};