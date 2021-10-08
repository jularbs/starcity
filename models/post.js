const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: ObjectId,
      ref: "User",
    },
    title: {
      type: String,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    content: {
      type: String,
    },
    featuredImage: {
      location: String,
      contentType: String,
      key: String,
    },
    status: {
      type: String,
      required: true,
      defualt: "draft",
    },
    meta: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
