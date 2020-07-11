/// <reference types="../../node_modules/@types/jest/index" />

import mongoose from "mongoose";
import User from "../../models/user";

// Testable
import userServices from "../user_services";

// @types
import { UserObject } from "../../types/models";

/**
 *  ? This test module testing user services
 *
 *  Every test have similar structure consisting of 3 parts
 *  • Given —— or answer, data which must be received after runnig test object. May have preparatory action
 *  • Result —— received object after running test obj
 *  • Checking —— process of comparisons giving and result. May have more comparisons such as amount of function calls
 *
 *  The test module is considered passed if all test cases were passed correctly
 *  All test modules will run by `npm run test` after commiting to master. Changes will apply only if all tests were passed
 */

// Sample user will use or modify for some cases
const sampleUser: UserObject = {
    id: undefined,
    name: "Иван",
    surname: "Иванов",
    photoUrl: "",
    phone: 79028319028,
    email: "ivanov_ivan@mail.ru",
    password: "ivanovcoolguy911",
    sex: true,
    city: "Москва",
    country: "Россия",
    consultations: [], // will add later
    reviews: [], // will add later
    notificationEmail: "ivanov_ivan@mail.ru",
    sendNotificationToEmail: true,
    sendMailingsToEmail: true,
    createdAt: new Date(),
    lastActiveAt: new Date(),
};

describe("Test UserServices", () => {
    let db: mongoose.Mongoose;

    // It's just so easy to connect to the MongoDB Memory Server
    // By using mongoose.connect
    beforeAll(async () => {
        db = await mongoose.connect(
            "mongodb://localhost/db",
            {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            },
            (err: any) => {
                if (err) {
                    console.error(err);
                }
            }
        );
    });

    // Close MongodDB connection after all test cases have done
    afterAll(async () => {
        db.disconnect();
    });

    // Remove all date from mongodb after each test case
    afterEach(async () => {
        await User.deleteMany({});
    });

    // SECTION: getUsers()
    describe("test getUsers()", () => {
        // ANCHOR: should get 3 users
        /** Test getting 3 simple users   */
        test("should get 3 users", async () => {
            //* Given
            const user1: UserObject = sampleUser;
            const user2: UserObject = {
                ...sampleUser,
                name: "Максим",
                email: "mail1@mail.com",
                notificationEmail: "mail1@mail.com",
            };
            const user3: UserObject = {
                ...sampleUser,
                name: "Евгений",
                email: "mail2@mail.com",
                notificationEmail: "mail2@mail.com",
            };

            //* Results
            // Test 1 user
            const create1 = await User.create(user1);
            user1.id = create1._id;
            const responce1 = await userServices.getUsers();
            const result1: UserObject[] | undefined = responce1.users;

            // Test 2 users
            const create2 = await User.create(user2);
            user2.id = create2._id;
            const responce2 = await userServices.getUsers();
            const result2: UserObject[] | undefined = responce2.users;

            // Test 3 users
            const create3 = await User.create(user3);
            user3.id = create3._id;
            const responce3 = await userServices.getUsers();
            const result3: UserObject[] | undefined = responce3.users;

            // Prepare answers
            const answer1: UserObject[] = [user1];
            const answer2: UserObject[] = [user1, user2];
            const answer3: UserObject[] = [user1, user2, user3];

            //* Checking
            expect(responce1.success).toBe(true);
            expect(responce2.success).toBe(true);
            expect(responce3.success).toBe(true);

            expect(responce1.message).toBeUndefined();
            expect(responce2.message).toBeUndefined();
            expect(responce3.message).toBeUndefined();

            expect(responce1.error).toBeUndefined();
            expect(responce2.error).toBeUndefined();
            expect(responce3.error).toBeUndefined();

            expect(result1).toEqual(answer1);
            expect(result2).toEqual(answer2);
            expect(result3).toEqual(answer3);
        });

        // ANCHOR: shouldn't get user after deleting
        /** Create and delete user. Function must return empty array */
        test("shouldn't get user after deleting", async () => {
            //* Given
            const answer: [] = [];

            //* Result
            const { _id } = await User.create(sampleUser);
            await User.remove({ _id: _id });

            const responce = await userServices.getUsers();
            const result = responce.users;

            //* Checking
            expect(responce.success).toBe(true);
            expect(responce.message).toBeUndefined();
            expect(responce.error).toBeUndefined();
            expect(result).toEqual(answer);
        });

        // ANCHOR: should get updated user
        /** Create and update user. Function must return array with updated user */
        test("should get updated user", async () => {
            //* Given
            const updatedUser: UserObject = { ...sampleUser, name: "Максим" };

            //* Result
            const { _id } = await User.create(sampleUser);
            await User.updateOne({ _id: _id }, updatedUser);

            updatedUser.id = _id;
            const answer: UserObject[] = [updatedUser];

            const responce = await userServices.getUsers();
            const result = responce.users;

            //* Checking
            expect(responce.success).toBe(true);
            expect(responce.message).toBeUndefined();
            expect(responce.error).toBeUndefined();
            expect(result).toEqual(answer);
        });
    });
    // /SECTION

    // SECTION: checkUserEmailAndPassword()
    describe("test checkUserEmailAndPassword()", () => {
        // ANCHOR: should validate sample user
        /** Create user and rememer email & password. Function must validate this data */
        test("should validate sample user", async () => {
            //* Given
            const email: string = sampleUser.email;
            const password: string = sampleUser.password;

            //* Result
            const { _id } = await User.create(sampleUser);

            const responce = await userServices.checkUserEmailAndPassword(
                email,
                password
            );
            const id = responce.id;

            //* Checking
            expect(responce.success).toBe(true);
            expect(responce.message).toBeUndefined();
            expect(responce.error).toBeUndefined();
            expect(responce.id).toBeDefined();
            expect(id).toStrictEqual(_id);
        });

        // ANCHOR: shouldn't validate wrong email
        /**
         * Create user and trying to validate with wrong email and correct password
         * Function must return success=false
         */
        test("shouldn't validate wrong email", async () => {
            //* Given
            const email = "wrong_email@mail.ru";
            const password = sampleUser.password;

            //* Result
            const { _id } = await User.create(sampleUser);

            const responce = await userServices.checkUserEmailAndPassword(
                email,
                password
            );

            //* Checking
            expect(responce.success).toBe(false);
            expect(responce.message).toBeDefined();
            expect(responce.error).toEqual("invalid_email");
            expect(responce.id).toBeUndefined();
        });
        // ANCHOR: shouldn't validate wrong password
        /**
         * Create user and trying to validate with correct email and wrong password
         * Function must return success=false
         */
        test("shouldn't validate wrong password", async () => {
            //* Given
            const email = sampleUser.email;
            const password = "somerandomwrongpassword";

            //* Result
            const { _id } = await User.create(sampleUser);

            const responce = await userServices.checkUserEmailAndPassword(
                email,
                password
            );

            //* Checking
            expect(responce.success).toBe(false);
            expect(responce.message).toBeDefined();
            expect(responce.error).toEqual("invalid_password");
            expect(responce.id).toBeUndefined();
        });
    });
    // /SECTION

    // todo ↓
    // SECTION: sendResetPasswordMail()
    describe("test sendResetPasswordMail()", () => {});
    // /SECTION

    // SECTION: validateUser()
    describe("test validateUser()", () => {
        // ANCHOR: should validate sample user
        /** Function must validate sample user */
        test("should validate sample user", async () => {
            //* Result
            const responce = await userServices.validateUser(sampleUser);

            //* Checking
            expect(responce.errors).toBeUndefined();
            expect(responce.success).toBe(true);
        });

        // ANCHOR: shouldn't validate unique error
        /** Create user. Function shouldn't validate user with the same email & notificationEmail */
        test("shouldn't validate unique error", async () => {
            //* Given
            const errors = {
                email: "unique_error",
                notificationEmail: "unique_error",
            };

            //* Result
            await User.create(sampleUser);
            const responce = await userServices.validateUser(sampleUser);

            //* Checking
            expect(responce.errors).toEqual(errors);
            expect(responce.success).toBe(false);
        });

        // ANCHOR: shouldn't validate type error
        /** Create user. Function shouldn't validate user with type errors */
        test("shouldn't validate type error", async () => {
            //* Given
            const errors = {
                name: "type_error",
                surname: "type_error",
                phone: "type_error",
                email: "type_error",
                password: "type_error",
                sex: "type_error",
                consultations: "type_error",
                reviews: "type_error",
                notificationEmail: "type_error",
                sendNotificationToEmail: "type_error",
                sendMailingsToEmail: "type_error",
                createdAt: "type_error",
                lastActiveAt: "type_error",
            };

            const user = {
                id: 123,
                photoUrl: 123,
                name: 123,
                surname: 123,
                phone: "123",
                email: 123,
                password: 123,
                sex: 123,
                consultations: "123",
                reviews: "123",
                notificationEmail: 123,
                sendNotificationToEmail: 123,
                sendMailingsToEmail: 123,
                createdAt: 123,
                lastActiveAt: 123,
            };

            //* Result
            const responce = await userServices.validateUser(user);

            //* Checking
            expect(responce.errors).toEqual(errors);
            expect(responce.success).toBe(false);
        });

        // ANCHOR: shouldn't validate length error
        /** Create user. Function shouldn't validate user with the length & required errors */
        test("shouldn't validate length & required error", async () => {
            //* Given
            const errors = {
                name: "required_error",
                surname: "required_error",
                password: "length_error",
            };

            const user = {
                ...sampleUser,
                name: "",
                surname: "",
                password: "12345",
            };

            //* Result
            const responce = await userServices.validateUser(user);

            //* Checking
            expect(responce.errors).toEqual(errors);
            expect(responce.success).toBe(false);
        });

        // ANCHOR: shouldn't validate incorrect email
        /** Function shouldn't validate user with incorrect email */
        test("shouldn't validate incorrect email", async () => {
            //* Given
            const errors = {
                email: "email_format_error",
                notificationEmail: "email_format_error",
            };
            const user = {
                ...sampleUser,
                email: "some.email.com",
                notificationEmail: "sommail@mail.",
            };

            //* Result
            const responce = await userServices.validateUser(user);

            //* Checking
            expect(responce.errors).toEqual(errors);
            expect(responce.success).toBe(false);
        });
    });
    // /SECTION

    // SECTION: setUserAvatar
    describe("test setUserAvatar()", () => {
        // ANCHOR: setUserAvatar()
        /** Create sample user. Function should update userAvatar. Checking by User.findOne()  */
        test("should set avatar", async () => {
            //* Given
            const avatarUrl =
                "https://it-here.ru/wp-content/uploads/2020/06/macos-big-sur.png";
            const { _id } = await User.create(sampleUser);

            //* Result
            const { success } = await userServices.setUserAvatar(
                _id,
                avatarUrl
            );
            const responce = await User.findOne({ _id: _id });

            //* Checking
            expect(success).toBe(true);
            expect(responce?.photoUrl).toEqual(avatarUrl);
        });

        // ANCHOR: should return error on unexisting user
        /** Trying to update photo of unexisting user. Function must return error */
        test("should return error on unexisting user ", async () => {
            //* Given
            const id = "some-fake-id";
            const avatarUrl =
                "https://it-here.ru/wp-content/uploads/2020/06/macos-big-sur.png";

            //* Result
            const {
                success,
                error,
                message,
            } = await userServices.setUserAvatar(id, avatarUrl);

            //* Checking
            expect(success).toBe(false);
            expect(error).toBe("no_user_found");
            expect(message).toBeDefined;
        });
    });
    // /SECTION

    // SECTION: getUserById()
    describe("test getUserById()", () => {
        //ANCHOR: should get sample user
        /** Create user by mongoose. Function must return this user */
        test("should get sample user", async () => {
            //* Given
            const { _id } = await User.create(sampleUser);
            const answer = { ...sampleUser, id: _id };

            //* Result
            const responce = await userServices.getUserById(_id);
            const user: UserObject | undefined = responce.user;

            //* Checking
            expect(responce.success).toBe(true);
            expect(responce.message).toBeUndefined();
            expect(responce.error).toBeUndefined();
            expect(user).toBeDefined();
            expect(user).toEqual(answer);
        });

        //ANCHOR: should return error on unexisting user
        /** Generate random uid and pass it to func. Function must return error */
        test("should return error on unexisting user", async () => {
            //* Given
            const id = "123456789101";

            //* Result
            const responce = await userServices.getUserById(id);

            //* Checking
            expect(responce.success).toBe(false);
            expect(responce.error).toBe("no_user_found_error");
            expect(responce.message).toBeDefined();
            expect(responce.user).toBeUndefined();
        });
    });
    // /SECTION

    // SECTION: createUser()
    describe("test createUser()", () => {
        //ANCHOR: should create sample user
        /** Function should create user and return user */
        test("should create sample user", async () => {
            //* Result
            const responce = await userServices.createUser(sampleUser);
            const success: boolean = responce.success;
            const user: UserObject | undefined = responce.user;
            const error: string | undefined = responce.error;
            const message: string | undefined = responce.message;

            const answer = { ...sampleUser, id: user?.id };

            //* Checking
            expect(success).toBe(true);
            expect(user).toBeDefined();
            expect(user).toEqual(answer);
            expect(error).toBeUndefined();
            expect(message).toBeUndefined();
        });

        //ANCHOR: shouldn't create user with unique errror
        /** Сreating user in advance. Function must return unique errors.  */
        test("should create sample user", async () => {
            //* Given
            const errors = {
                email: "unique_error",
                notificationEmail: "unique_error",
            };
            await User.create(sampleUser);

            //* Result
            const responce = await userServices.createUser(sampleUser);
            const success: boolean = responce.success;
            const user: UserObject | undefined = responce.user;
            const error: string | undefined = responce.error;
            const message: string | undefined = responce.message;

            //* Checking
            expect(success).toBe(false);
            expect(user).toBeUndefined();
            expect(error).toEqual("not_validated_error");
            expect(responce.errors).toEqual(errors);
            expect(message).toBeDefined();
        });
    });
    // /SECTION

    // SECTION: updateUser()
    describe("test updateUser()", () => {
        // ANCHOR: should update sample user
        /** Create user by mongoose. Function should update user */
        test("should update sample user", async () => {
            //* Given
            const updated: UserObject = {
                id: undefined,
                name: "Вера",
                surname: "Баскова",
                photoUrl: "someUrl",
                phone: 79028319023,
                email: "vera_is_cool@mail.ru",
                password: "tyneugadaeshetotparol",
                sex: false,
                city: "Нур-Султан",
                country: "Казахстан",
                consultations: [], // will add later
                reviews: [], // will add later
                notificationEmail: "veras_second_email@mail.ru",
                sendNotificationToEmail: false,
                sendMailingsToEmail: false,
                createdAt: new Date(),
                lastActiveAt: new Date(),
            };
            const { _id } = await User.create(sampleUser);
            updated.id = _id;

            //* Result
            const responce = await userServices.updateUser(updated);
            const user: UserObject | undefined = responce.user;

            //* Checking
            expect(responce.success).toBe(true);
            expect(user).toEqual(updated);
            expect(responce.error).toBeUndefined();
            expect(responce.message).toBeUndefined();
            expect(responce.validationErrors).toBeUndefined();
        });

        // ANCHOR: shouldn't update user with not unique new email
        /**
         * Create 2 users by mongoose. Function shouldn't update user-1
         * with the same email as the user-2
         */
        test("shouldn't update user with not unique new email", async () => {
            //* Given
            const user2 = {
                ...sampleUser,
                email: "someemail@mail.com",
                notificationEmail: "someemail@mail.com",
            };

            // User-2 updated
            const updated: UserObject = {
                id: undefined,
                name: "Вера",
                surname: "Баскова",
                photoUrl: "someUrl",
                phone: 79028319023,
                email: sampleUser.email,
                password: "tyneugadaeshetotparol",
                sex: false,
                city: "Нур-Султан",
                country: "Казахстан",
                consultations: [], // will add later
                reviews: [], // will add later
                notificationEmail: sampleUser.notificationEmail,
                sendNotificationToEmail: false,
                sendMailingsToEmail: false,
                createdAt: new Date(),
                lastActiveAt: new Date(),
            };

            // errors of user-2
            const errors = {
                email: "unique_error",
                notificationEmail: "unique_error",
            };

            // create users
            await User.create(sampleUser); // user-1
            const { _id } = await User.create(user2); // user-2
            updated.id = _id;

            //* Result
            // update user-2
            const responce = await userServices.updateUser(updated);
            const user: UserObject | undefined = responce.user;

            //* Checking
            expect(responce.success).toBe(false);
            expect(user).toBeUndefined();
            expect(responce.error).toEqual("not_validated_error");
            expect(responce.validationErrors).toEqual(errors);
            expect(responce.message).toBeDefined();
        });
    });
    // /SECTION

    // SECTION: removeUser()
    describe("test removeUser()", () => {
        // ANCHOR: should remove sample user
        /** Create sample user by mongoose. Function should remove this user */
        test("should remove sample user", async () => {
            //* Given
            const { _id } = await User.create(sampleUser);
            const user = { ...sampleUser, id: _id };

            //* Result
            const responce = await userServices.removeUser(_id);
            const users = await User.find({});

            //* Checking
            expect(responce.success).toBe(true);
            expect(responce.user).toEqual(user);
            expect(responce.error).toBeUndefined();
            expect(responce.message).toBeUndefined();
            expect(users.length).toEqual(0);
        });

        // ANCHOR: shouldn't return error on not exisiting user
        /** Trying to remove not existing user. Function should return error no_user_found*/
        test("shouldn't return error on not exisiting user", async () => {
            //* Given
            const id: string = "123456789101";

            //* Result
            const responce = await userServices.removeUser(id);

            //* Checking
            expect(responce.success).toBe(false);
            expect(responce.error).toEqual("no_user_found");
            expect(responce.message).toBeDefined();
        });
    });
    // /SECTION
});