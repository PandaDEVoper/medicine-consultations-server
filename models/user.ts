import { Schema, model } from "mongoose";

// @types
import { IUser } from "../types/models";

const reqiredField = [true, "required_error"];
const uniqueField = [true, "unique_error"];

const user = new Schema({
    name: {
        type: String,
        required: reqiredField,
        validate: [(value) => value.length > 0, "length_error"],
    },
    surname: {
        type: String,
        required: reqiredField,
        validate: [(value) => value.length > 0, "length_error"],
    },
    photoUrl: {
        type: String,
    },
    phone: {
        required: false,
        type: Number,
        validate: [
            (val) => {
                if (val == undefined || val == -1) return true;

                // 79323327361 --> 7
                // 7932332736  --> 0
                // 1111111111  --> 1
                const firstNumber = Math.floor(val / 10000000000);

                if (firstNumber != 7) return false;

                return true;
            },
            "phone_format_number",
        ],
    },
    email: {
        type: String,
        required: reqiredField,
        unique: uniqueField,
        validate: [
            (val) => {
                var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                return re.test(val);
            },
            "email_format_error",
        ],
    },
    password: {
        type: String,
        required: reqiredField,
        validate: [(value) => value.length >= 6, "length_error"],
    },
    sex: {
        type: Boolean,
        required: reqiredField,
    },
    city: {
        type: String,
    },
    country: {
        type: String,
    },
    consultations: [], // todo
    reviews: [], // todo
    notificationEmail: {
        type: String,
        unique: true,
        required: true,
    },
    sendNotificationToEmail: {
        type: Boolean,
        required: true,
    },
    sendMailingsToEmail: {
        type: Boolean,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    lastActiveAt: {
        type: Date,
        required: true,
    },
});

export default model<IUser>("User", user);