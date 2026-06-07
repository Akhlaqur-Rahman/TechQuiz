import mongoose from "mongoose";

export const connectDb = async () => {
    await mongoose.connect("mongodb+srv://ahaan9091_db_user:SNhrnLtF9jYXQL2M@cluster0.6z2ynw8.mongodb.net/?appName=TechQuiz")
        .then(() => {
            console.log("MongoDb connected successfully..!")
        })
}