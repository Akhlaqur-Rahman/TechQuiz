import Quiz from "../models/quizModel.js";
import {User} from "../models/userModel.js";

const LETTERS = ["A", "B", "C", "D"];

const isReadableText = (value) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  !value.includes("\uFFFD") &&
  !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value);

const hasValidQuestions = (questions) =>
  Array.isArray(questions) &&
  questions.length > 0 &&
  questions.every(
    ({ question, options, answerKey }) =>
      isReadableText(question) &&
      Array.isArray(options) &&
      options.length === 4 &&
      options.every(isReadableText) &&
      LETTERS.includes(answerKey),
  );

// CREATE & UPDATE QUIZ
export const uploadQuiz = async (req, res) => {
  try {
    const { technology, level, subName, timeLimit, questions } = req.body;
    const createdBy = req.auth?.userId;
    const normalizedLevel = level || "General";
    const normalizedSubName = subName?.trim().toLowerCase() || "";

    if (
      !isReadableText(technology) ||
      !hasValidQuestions(questions)
    ) {
      return res.status(400).json({
        message:
          "Invalid quiz data. Upload a readable question table with four options and an A, B, C, or D answer.",
      });
    }

    const quiz = await Quiz.findOneAndUpdate(
      {
        technology: technology.toLowerCase(),
        level: normalizedLevel,
        subName: normalizedSubName,
      },
      {
        technology: technology.toLowerCase(),
        level: normalizedLevel,
        subName: normalizedSubName,
        timeLimit,
        questions,
        totalQuestions: questions.length,
        createdBy,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.json({ success: true, quiz });

  } catch (error) {
  console.error("Upload Quiz error:", error);
  res.status(400).json({
    message: error.name === "ValidationError"
      ? "Invalid quiz data. Each question needs four options and an A, B, C, or D answer."
      : "Unable to save quiz.",
  });
}
};


// GET ALL QUIZZES
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    return res.json(quizzes);
  } catch (error) {
    console.log("Get Quiz Error:", error);
    return res.status(500).json({ success: false });
  }
};


// DELETE QUIZ
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByIdAndDelete(id);

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found...😩" });
    }

    return res.json({
      success: true,
      message: "Quiz deleted successfully...👍",
    });

  } catch (error) {
    console.log("Delete Quiz error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting quiz",
    });
  }
};
