import RideCategory from "./rideCategory.model.js";
import Ride from "../ride/ride.model.js";
import slugify from "slugify";
import formidable from "formidable";
import { createEntry } from "../auditTrail/auditTrail.controller.js";
export const create = async (req, res) => {
  const { name, description } = req.body;

  const slug = slugify(name).toLowerCase();

  let rideCategory = new RideCategory();

  rideCategory.name = name;
  rideCategory.description = description;
  rideCategory.slug = slug;

  try {
    const result = await rideCategory.save();
    createEntry(req.profile.name, `Created new Ride Category`, result, req);
    return res.json({ data: result, success: "Ride Category added successfully!" });
  } catch (err) {
    return res.status(400).json({
      error: "Failed to add new ride category. Please try again!",
    });
  }
};

export const read = async (req, res) => {
  try {
    const data = await RideCategory.findOne({ slug: req.params.slug })
      .select("name description slug image meta")
      .exec();
    res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};

export const list = async (req, res) => {
  try {
    const data = await RideCategory.find().exec();
    res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};

export const update = async (req, res) => {
  const { slug, name, description } = req.body;

  const rideCategory = await RideCategory.findOne({ slug: slug }).exec();

  rideCategory.name = name;
  rideCategory.description = description;

  try {
    const result = await rideCategory.save();
    res.json({ result, status: "success" });
    createEntry(req.profile.name, `Updated Ride Category ${name}`, result, req);
  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};

export const remove = async (req, res) => {
  const { slug } = req.body;

  try {
    if (!slug) {
      return res.status(400).json({
        error: "Slug is required",
      });
    }

    const rideCategory = await RideCategory.findOne({ slug }).exec();
    if (!rideCategory) {
      return res.status(404).json({
        error: "Ride Category not found",
      });
    }

    const referencedRides = await Ride.find({ rideCategoryId: rideCategory._id }).exec();
    if (referencedRides.length > 0) {
      return res.status(400).json({
        error: "Cannot delete ride category with existing rides",
      });
    }

    const result = await RideCategory.findOneAndDelete({ slug }).exec();
    createEntry(req.profile.name, `Deleted Ride Category`, { slug }, req);
    res.json({ success: "Ride Category deleted successfully" });
  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};
