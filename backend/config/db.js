import mongoose from "mongoose";
import Quiz from "../models/quizModel.js";

export const connectDb = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // Existing quizzes get the optional metadata defaults before replacing the
  // old technology + level index with the metadata-aware unique index.
  await Quiz.updateMany(
    { subName: { $exists: false } },
    { $set: { subName: "" } },
  );
  await Quiz.updateMany(
    { level: { $exists: false } },
    { $set: { level: "General" } },
  );
  await Quiz.syncIndexes();

  console.log("MongoDb connected successfully..!");
};
