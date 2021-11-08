const mongoose = require("mongoose");

const healthDeclarationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    emailAddress: {
      type: String,
      required: true,
    },
    nationality: {
      type: String,
      required: true,
    },
    permanentAddress: {
      type: String,
      required: true,
    },
    currentAddress: {
      type: String,
    },
    companyName: {
      type: String,
    },
    sex: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    birthDate: {
      type: String,
      required: true,
    },
    recentTravel: {
      type: String,
    },
    questionAnswer: [
      {
        question: String,
        answer: String,
      },
    ],
    signature: {
      location: String,
      bucket: String,
      key: String,
    },
    dateSubmitted: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthDeclaration", healthDeclarationSchema);
