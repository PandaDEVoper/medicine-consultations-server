// @types
import { UserObject } from "./models";

/**
 *  This type describe return object of UserServices.getUsers() function
 */
export type TGetUsers = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?: "invalid_error";

    // Show error message if failed
    message?: string;

    // Return operation results if success
    users?: UserObject[];
};

/**
 *  This type describe return object of
 *  UserServices.checkUserEmailAndPassword(email: string, password : string) function
 */
export type TCheckUserEmailAndPassword = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?: "invalid_error" | "invalid_password" | "invalid_email";

    // Show error message if failed
    message?: string;

    // Return operation results if success
    id?: string;
};

/**
 *  This type describe return object of
 *  UserServices.checkUserEmailAndPassword(email: string, password : string) function
 */
export type TSendResetPasswordMail = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?: "invalid_error" | "invalid_password" | "invalid_email";

    // Show error message if failed
    message?: string;

    // Return operation results if success
    id?: string;
};

/**
 *  This enum describe types of validation error
 */
export enum TValidationErrorType {
    RequiredError = "required_error",
    TypeError = "type_error",
    UniqueError = "unique_error",
    LengthError = "length_error",
    PhoneFormatError = "phone_format_error",
    EmailFormatError = "email_format_error",
}

/**
 * This type describe error object from UserServices.validateUser() function
 */
export type TValidationErrors = {
    name?: TValidationErrorType;
    surname?: TValidationErrorType;
    phone?: TValidationErrorType;
    email?: TValidationErrorType;
    password?: TValidationErrorType;
    sex?: TValidationErrorType;
    consultations?: TValidationErrorType;
    reviews?: TValidationErrorType;
    notificationEmail?: TValidationErrorType;
    sendMailingsToEmail?: TValidationErrorType;
    sendNotificationToEmail?: TValidationErrorType;
    createdAt?: TValidationErrorType;
    lastActiveAt?: TValidationErrorType;
};

/**
 * This type describe return object from UserServices.validateUser() function
 */
export type TValidateUser = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    errors?: TValidationErrors;
};

/**
 * This type describe error object from UserServices.setAvatar() function
 */
export type TSetUserAvatar = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?: "invalid_args" | "invalid_error" | "no_user_found";

    // Show error message if failed
    message?: string;
};

/**
 * This type describe error object from UserServices.getUserById() function
 */
export type TGetUserById = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?: "no_user_found_error" | "invalid_error" | "no_user_found";

    // Show error message if failed
    message?: string;

    // Return user if success
    user?: UserObject;
};

/**
 * This type describe error object from UserServices.createUser() function
 */
export type TCreateUser = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?:
        | "no_user_found_error"
        | "invalid_error"
        | "no_user_found"
        | "created_user_is_null"
        | "not_validated_error";

    // Validation errors
    errors?: TValidationErrors;

    // Show error message if failed
    message?: string;

    // Return user if success
    user?: UserObject;
};

/**
 * This type describe error object from UserServices.updateUser() function
 */
export type TUpdateUser = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?: "updated_user_is_null" | "invalid_error" | "not_validated_error";

    // Show error message if failed
    message?: string;

    // Return user if success
    user?: UserObject;

    // Return validation errors if failed validation
    validationErrors?: TValidationErrors;
};

/**
 * This type describe error object from UserServices.removeUser() function
 */
export type TRemoveUser = {
    // Is operation going success
    success: true | false;

    // Return error if failed
    error?: "no_user_found" | "invalid_error" | "removed_user_is_null";

    // Return error message if failed
    message?: string;

    // Return user if success
    user?: UserObject;
};

// All types in one object