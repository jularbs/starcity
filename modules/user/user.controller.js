import User from "../user/user.model.js";

export const remove = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({ _id: id }).exec();

        if (!user)
            return res.status(400).json({ error: "User not found" })

        user.deletedAt = new Date();
        user.email = new Date().toISOString(); //convert to datetime so email can be registered again due to unique constraint

        await user.save();

        return res.json({
            success: "User removed successfully",
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            error: "Failed to remove user. Please try again later.",
        });
    }

};

export const read = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findOne({ _id: id })
            .select("_id name email createdAt department")
            .exec();

        if (!user)
            return res.status(400).json({ error: "User not found" });

        return res.json(user);
    } catch (e) {
        console.log("Error: ", e)
        return res.status(400).json({ error: "Error on getting user information" });
    }
};

export const update = async (req, res) => {
    const { _id } = req.body;

    const user = await User.findOne({ _id: _id }).exec();

    if (!user)
        return res.status(400).json({ error: "User not found" })

    if (req.body?.name)
        user.name = req.body?.name;

    if (req.body?.status)
        user.status = req.body?.status;

    if (req.body?.email)
        user.email = req.body?.email;

    if (req.body?.department)
        user.department = req.body?.department;

    try {
        await user.save();
        return res.json({
            success: "User updated successfully",
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            error: "Failed to update user. Please try again later.",
        });
    }
};

export const list = async (req, res) => {
    const {
        query = "",
        department = "",
        skip = 0,
        limit = 0,
        status = false,
    } = req.query;

    //init filters
    const filters = {};
    const andOperator = [];

    if (query) {
        const words = query.split(" ");
        words.map((word) => {
            andOperator.push({
                name: {
                    $regex: `\\b${word.replace(/[-[\]{}()*+?.,\\/^$|#\s]/g, "\\$&")}\\b`, //Escape "[", "]", and must be full words using \\b \\b
                    $options: "i",
                },
            });
        });
    }

    if (status)
        filters.status = status

    if (department)
        filters.department = department;

    if (andOperator.length > 0) {
        filters.$and = andOperator;
    }

    try {
        const users = await User.find({ ...filters })
            .select("_id name email createdAt department status lastLogin")
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .exec();

        const count = await User.countDocuments({ ...filters });

        return res.json({
            data: users,
            count: count
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            error: "Something went wrong"
        });
    }
}