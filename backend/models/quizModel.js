import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (v) =>
        Array.isArray(v) &&
        v.length === 4 &&
        v.every((opt) => opt && opt.trim()),
      message: "Each question must contain 4 valid options",
    },
  },
  answerKey: {
    type: String,
    enum: ["A", "B", "C", "D"],
    required: true,
  },
});

// QUIZ SCHEMA
const quizSchema = new mongoose.Schema(
  {
    technology: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    level: {
      type: String,
      enum: ["General", "Basic", "Intermediate", "Advanced"],
      default: "General",
    },

    subName: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    timeLimit: {
      type: Number,
      required: true,
      min: 1,
    },

    questions: {
      type: [questionSchema],
      required: true,
    },

    
    totalQuestions: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//  Auto-calculate totalQuestions safely
quizSchema.pre("save", function (next) {
  this.totalQuestions = this.questions ? this.questions.length : 0;
  next();
});


quizSchema.index(
  { technology: 1, level: 1, subName: 1 },
  { unique: true },
);

export default mongoose.model("Quiz", quizSchema);
