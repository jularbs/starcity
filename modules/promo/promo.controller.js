//TODOS: Handle duplicate errors
import Promo from "./promo.model.js";
import formidable from "formidable";
export const create = async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.log(err)
            return res.status(400).json({ error: "Error on parsing form. Please try again later." })
        }

        const { code, campaignName, startDate,
            endDate, percentageDiscount,
            fixedDiscount, maxDiscount, minimumRequired,
            maxUsage, status, paymentOptions } = fields;

        const promo = new Promo();
        promo.code = code;
        promo.campaignName = campaignName;
        promo.startDate = startDate;
        promo.endDate = endDate;

        if (percentageDiscount)
            promo.percentageDiscount = percentageDiscount;

        if (fixedDiscount)
            promo.fixedDiscount = fixedDiscount;

        if (maxDiscount)
            promo.maxDiscount = maxDiscount;

        if (minimumRequired)
            promo.minimumRequired = minimumRequired;

        if (maxUsage)
            promo.maxUsage = maxUsage;

        if (status)
            promo.status = status;

        if (paymentOptions)
            promo.acceptedPaymentMethods = JSON.parse(paymentOptions)


        try {
            const result = await promo.save();
            return res.json({
                success: "Promo Code created successfully",
                data: result
            });
        } catch (err) {
            console.log(err);
            return res.status(400).json({
                error: "Failed to add promo. Please try again later.",
            });
        }
    });
}

export const read = async (req, res) => {
    const { id } = req.params;

    const promo = await Promo.findOne({ _id: id }).exec();
    return res.json(promo)

}

export const update = async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.log(err)
            return res.status(400).json({ error: "Error on parsing form. Please try again later." })

        }

        const { _id, code, campaignName, startDate,
            endDate, percentageDiscount,
            fixedDiscount, maxDiscount, minimumRequired,
            maxUsage, status, paymentOptions } = fields;

        const promo = await Promo.findOne({ _id: _id }).exec();
        if (!promo)
            return res.status(400).json({ error: "Promo code not found." })

        promo.code = code;
        promo.campaignName = campaignName;
        promo.startDate = startDate;
        promo.endDate = endDate;

        if (percentageDiscount)
            promo.percentageDiscount = percentageDiscount;

        if (fixedDiscount)
            promo.fixedDiscount = fixedDiscount;

        if (maxDiscount)
            promo.maxDiscount = maxDiscount;

        if (minimumRequired)
            promo.minimumRequired = minimumRequired;

        if (maxUsage)
            promo.maxUsage = maxUsage;

        if (status)
            promo.status = status;

        if (paymentOptions)
            promo.acceptedPaymentMethods = JSON.parse(paymentOptions)


        try {
            const result = await promo.save();
            return res.json({
                success: "Promo Code updated successfully",
                data: result
            });
        } catch (err) {
            console.log(err);
            return res.status(400).json({
                error: "Failed to update promo. Please try again later.",
            });
        }
    });
};

export const list = async (req, res) => {
    const promos = await Promo.find({}).exec();

    return res.json(promos)
}

export const remove = async (req, res) => {
    const { id } = req.params;
    const promo = await Promo.findOne({ _id: id }).exec();

    if (!promo)
        return res.status(400).json({ error: "Promo Code not found" })

    promo.deletedAt = new Date();

    try {
        const result = await promo.save();
        return res.json({
            success: "Promo Code removed successfully",
            data: result
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            error: "Failed to remove promo. Please try again later.",
        });
    }
}

export const apply = async (req, res) => {
    const { code, transactionAmount } = req.query;

    const promo = await Promo.findOne({ code: code.toUpperCase() })
        .populate("acceptedPaymentMethods", "name slug status")
        .exec();

    //check if code exists
    if (!promo)
        return res.status(400).json({
            error: "Promo Code invalid or expired."
        })

    //check if status is true
    if (!promo.status)
        return res.status(400).json({
            error: "Promo Code invalid or expired."
        })

    //check if now is within range
    //TODOS: check timezones specially on production
    const now = new Date();
    if (now < promo.startDate || now > promo.endDate)
        return res.status(400).json({
            error: "Promo Code invalid or expired."
        })

    //check if minimum total is met
    if (promo.minimumRequired > 0 && transactionAmount < promo.minimumRequired)
        return res.status(400).json({
            error: "Minimum required price not met."
        })

    if (promo.fixedDiscount > 0)
        return res.json({ code: promo.code, discount: promo.fixedDiscount, paymentMethods: promo.acceptedPaymentMethods })

    //respond with code, percentage discount, paymentMethods
    return res.json({ code: promo.code, discount: transactionAmount * promo.percentageDiscount * .01, paymentMethods: promo.acceptedPaymentMethods })
}

export const processPromo = async (code, transactionAmount) => {
    return new Promise(async (resolve, reject) => {
        const promo = await Promo.findOne({ code: code.toUpperCase() })
            .exec();

        //revalidate promo code on transaction
        if (!promo) {
            resolve({ promoCode: null, discount: 0 });
            return;
        }

        if (promo.fixedDiscount > 0) {
            resolve({ promoCode: promo._id, discount: promo.fixedDiscount })
            return;
        }

        resolve({ promoCode: promo._id, discount: transactionAmount * promo.percentageDiscount * .01 })
        return;

    })
}

export const toggle = async (req, res) => {
    const { id } = req.body;
    const promo = await Promo.findOne({ _id: id })
        .exec();

    if (!promo)
        return res.status(400).json({
            error: "Promo Code not found"
        })

    promo.status = !promo.status;

    try {
        const result = await promo.save();
        return res.json({
            success: "Promo toggled successfully",
            data: result
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            error: "Failed to toggle promo. Please try again later.",
        });
    }
}