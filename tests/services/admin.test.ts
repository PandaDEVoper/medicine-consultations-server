/// <reference types="../../node_modules/@types/jest/index" />

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Admin from "../../models/admin";
import Doctor from "../../models/doctor";

// Testable
import adminServices from "../../services/admin_services";

// @types
import {
    AdminObj,
    AdminRole,
    BecomeDoctorObj,
    DoctorObject,
} from "../../types/models";
import { DoctorObjToBecomeDoctorObj } from "../../services/types_services";
import { BecomeDoctorRequest } from "../../models/doctor";
import { AdminAccessToken, AdminRefreshToken } from "../../models/tokens";
import { access } from "fs";
import { request } from "http";
import { EWorkPlan } from "../../types/services";

/**
 *  ? This test module testing admin services
 *
 *  Every test have similar structure consisting of 3 parts
 *  • Arrange  —— initializes objects and sets the value of data passed to the method for the test.
 *  • Act  —— calls a method for the test with the placed parameters.
 *  • Assert  —— checks that the method for the test works as expected.
 *
 *  The test module is considered passed if all test cases were passed correctly
 *  All test modules will run by `npm run test` after commiting to master. Changes will apply only if all tests were passed
 */

// Sample user will use or modify for some cases
const sampleAdmin: AdminObj = {
    username: "panda.code",
    email: "sample@mail.com",
    id: undefined,
    name: "Ivan",
    password: "12345678",
    photoUrl:
        "https://www.gameplan-a.com/wp-content/themes/gameplan-a/assets/img/share/gameplan-a.jpg",
    role: AdminRole.Admin,
};

// Sample user will use or modify for some cases
const sampleDoctor: DoctorObject = {
    id: undefined,
    name: "Иван",
    surname: "Иванов",
    patronymic: "Иванович",
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
    blankNumber: "12345678",
    blankSeries: "12345678",
    _education: "МГУ",
    issueDate: "21.11.2015",
    yearEducation: "2010 - 2015",
    beginDoctorDate: new Date(),
    clientsConsultations: [], // will add later
    clientsReviews: [], // will add later
    experience: 3 * 365,
    favourites: [], // will add later
    rating: 4.6,
    schedule: [], // will add later
    speciality: [],
    whosFavourite: [], // will add later
    passportIssueDate: "21.11.2015",
    passportIssuedByWhom: "МВД г. Москвы",
    passportSeries: "123123",
    _workExperience: "1 год",
    _workPlaces: "Городская поликлиника №1 г. Москва",
    serviceExperience: 365,
    age: 35,
    isAdult: false,
    isChild: true,
    workPlan: EWorkPlan.Multiple,
    fullName: "Иванов Иван Иванович",
    activeConsultations: [],
};

const sampleRequest: BecomeDoctorObj = DoctorObjToBecomeDoctorObj(sampleDoctor);

process.env.MODE = "testing";
process.env.url = "localhost:5000/";
process.env.port = "5000";
process.env.mongodb_url = "mongodb://localhost/db";
process.env.useNewUrlParser = "true";
process.env.useFindAndModify = "false";
process.env.useUnifiedTopology = "true";
process.env.jwt_access = "test-access-string";
process.env.jwt_refresh = "test-refresh-string";
process.env.jwt_admin_access = "test-admin-access-string";
process.env.jwt_admin_refresh = "test-admin-refresh-string";

describe("Test Admin services", () => {
    let db: mongoose.Mongoose;

    // It's just so easy to connect to the MongoDB Memory Server
    // By using mongoose.connect
    beforeAll(async () => {
        db = await mongoose.connect(
            "mongodb://localhost/test",
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
        await Admin.remove({});
        await Doctor.remove({});
        await BecomeDoctorRequest.remove({});
        await AdminAccessToken.remove({});
        await AdminRefreshToken.remove({});
    });

    // SECTION login()
    describe("login()", () => {
        // ANCHOR: should login sample admin
        test("should login sample admin", async () => {
            //* Arrange
            const { _id } = await Admin.create(sampleAdmin);
            const id = String(_id);
            const admin = { ...sampleAdmin, id };

            //* Act
            const response = await adminServices.login(
                sampleAdmin.username,
                sampleAdmin.password
            );

            //* Assert
            expect(response.success).toEqual(true);
            expect(response.admin).toEqual(admin);

            const jwt_access: string = process.env.jwt_admin_access ?? "-";
            const jwt_refresh: string = process.env.jwt_admin_refresh ?? "-";

            // Verify tokens
            const id_access: any = jwt.verify(
                response.tokens?.access ?? "",
                jwt_access
            );
            const id_refresh: any = jwt.verify(
                response.tokens?.refresh ?? "",
                jwt_refresh
            );

            const accessToken = await AdminAccessToken.find({
                value: response.tokens?.access ?? "",
            });
            const refreshToken = await AdminRefreshToken.find({
                value: response.tokens?.refresh ?? "",
            });
            expect(accessToken).toBeDefined();
            expect(refreshToken).toBeDefined();

            expect(id_access.id).toEqual(id);
            expect(id_refresh.id).toEqual(id);
        });

        // ANCHOR: shouldn't login error admin
        test("shouldn't login error admin", async () => {
            //* Arrange
            const { _id } = await Admin.create(sampleAdmin);
            const id = String(_id);
            const admin = { ...sampleAdmin, id };

            //* Act
            const response = await adminServices.login(
                "fake_username",
                "fake_password"
            );

            //* Assert
            expect(response.success).toEqual(false);
            expect(response.admin).toBeUndefined();
            expect(response.tokens).toBeUndefined();

            const accessTokens = await AdminAccessToken.find({});
            const refreshTokens = await AdminRefreshToken.find({});

            expect(accessTokens.length).toEqual(0);
            expect(refreshTokens.length).toEqual(0);
        });
    });
    // /SECTION

    // SECTION: submitBecomeDoctorRequests()
    describe("submitBecomeDoctorRequests()", () => {
        // ANCHOR: should submit sample request
        test("should submit sample request", async () => {
            //* Arrange
            const id = (await BecomeDoctorRequest.create(sampleRequest)).id;

            //* Act
            const response = await adminServices.submitBecomeDoctorRequests(id);

            //* Assert
            expect(response.success).toEqual(true);

            const requests = await BecomeDoctorRequest.find({});
            const doctors = await Doctor.find({});

            expect(requests).toEqual([]);
            expect(doctors.length).toEqual(1);
        });

        // ANCHOR: shouldn't submit request with invalid id
        test("shouldn't submit request with invalid id", async () => {
            //* Arrange
            const id = "123456789101";

            //* Act
            const response = await adminServices.submitBecomeDoctorRequests(id);

            //* Assert
            expect(response.success).toEqual(false);
        });
    });
    // /SECTION

    // SECTION: checkAccessToken
    describe("checkAccessToken()", () => {
        // ANCHOR: should validate sample token
        test("should validate sample token", async () => {
            //* Arrange
            const { _id } = await Admin.create(sampleAdmin);
            const { tokens } = await adminServices.login(
                sampleAdmin.username,
                sampleAdmin.password
            );

            //* Act
            const isOk = await adminServices.checkAccessToken(
                String(_id),
                tokens?.access ?? ""
            );

            //* Assert
            expect(isOk).toEqual(true);
        });

        // ANCHOR: shouldn't validate invalid token
        test("shouldn't validate invalid token", async () => {
            //* Arrange
            const { _id } = await Admin.create(sampleAdmin);

            //* Act
            const isOk = await adminServices.checkAccessToken(
                String(_id),
                "1.2.3"
            );

            //* Assert
            expect(isOk).toEqual(false);
        });

        // ANCHOR: shouldn't validate invalid id
        test("shouldn't validate invalid id", async () => {
            //* Arrange
            const { _id } = await Admin.create(sampleAdmin);
            const { tokens } = await adminServices.login(
                sampleAdmin.username,
                sampleAdmin.password
            );

            //* Act
            const isOk = await adminServices.checkAccessToken(
                "some-id",
                tokens?.access ?? ""
            );

            //* Assert
            expect(isOk).toEqual(false);
        });

        // ANCHOR: shouldn't validate id which not in db
        test("shouldn't validate id which not in db", async () => {
            //* Arrange
            const { _id } = await Admin.create(sampleAdmin);

            //* Act
            const isOk = await adminServices.checkAccessToken(
                _id,
                "123.123.123"
            );

            //* Assert
            expect(isOk).toEqual(false);
        });
    });
    // /SECTION

    // SECTION: checkRefreshToken
    describe("checkRefreshToken()", () => {
        // ANCHOR: should validate sample token
        test("should validate sample token", async () => {
            //* Arrange
            const { _id } = await Admin.create(sampleAdmin);
            const { tokens } = await adminServices.login(
                sampleAdmin.username,
                sampleAdmin.password
            );

            //* Act
            const isOk = await adminServices.checkRefreshToken(
                String(_id),
                tokens?.refresh ?? ""
            );

            //* Assert
            expect(isOk).toEqual(true);
        });

        // ANCHOR: shouldn't validate invalid token
        test("shouldn't validate invalid token", async () => {
            //* Arrange
            const { _id } = await Admin.create(sampleAdmin);

            //* Act
            const isOk = await adminServices.checkRefreshToken(
                String(_id),
                "1.2.3"
            );

            //* Assert
            expect(isOk).toEqual(false);
        });

        // ANCHOR: shouldn't validate invalid id
        test("shouldn't validate invalid id", async () => {
            //* Arrange
            const { _id } = await Admin.create(sampleAdmin);
            const { tokens } = await adminServices.login(
                sampleAdmin.username,
                sampleAdmin.password
            );

            //* Act
            const isOk = await adminServices.checkRefreshToken(
                "some-id",
                tokens?.refresh ?? ""
            );

            //* Assert
            expect(isOk).toEqual(false);
        });

        // ANCHOR: shouldn't validate id which not in db
        test("shouldn't validate id which not in db", async () => {
            //* Arrange
            const { _id } = await Admin.create(sampleAdmin);

            //* Act
            const isOk = await adminServices.checkRefreshToken(
                _id,
                "123.123.123"
            );

            //* Assert
            expect(isOk).toEqual(false);
        });
    });
    // /SECTION

    // SECTION: isTokenExpired
    describe("Is token expired", () => {
        // ANCHOR: should validate sample token
        test("should validate sample token", () => {
            //* Arrange
            const token = jwt.sign("test", process.env.jwt_admin_access ?? "");

            //* Act
            const isExpired = adminServices.isTokenExpired(token);

            //* Assert
            expect(isExpired).toEqual(false);
        });

        // ANCHOR: shouldn't validate expired token
        test("shouldn't validate expired token", async () => {
            //* Arrange
            const token = jwt.sign(
                { test: "test" },
                process.env.jwt_admin_access ?? "",
                {
                    expiresIn: "1s",
                    algorithm: "HS256",
                }
            );

            //* Act
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const isExpired = adminServices.isTokenExpired(token);

            //* Assert
            expect(isExpired).toEqual(true);
        });
    });
    // /SECTION

    // SECTION: generateTokens
    describe("generateTokens()", () => {
        // ANCHOR: should generate new tokens
        test("should generate new tokens", async () => {
            //* Arrange
            const adminId = "123456789101";
            const oldAccess = jwt.sign(
                adminId,
                process.env.jwt_admin_access ?? ""
            );
            const oldRefresh = jwt.sign(
                adminId,
                process.env.jwt_admin_refresh ?? ""
            );
            await AdminAccessToken.create({ value: oldAccess });
            await AdminRefreshToken.create({ value: oldRefresh });

            //* Act
            const response = await adminServices.generateTokenAndDeleteOld(
                adminId,
                oldAccess,
                oldRefresh
            );

            //* Assert
            expect(response.access).toBeDefined();
            expect(response.refresh).toBeDefined();

            const isAccessOk = await adminServices.checkAccessToken(
                adminId,
                response.access
            );
            const isRefreshOk = await adminServices.checkRefreshToken(
                adminId,
                response.refresh
            );
            expect(isAccessOk).toEqual(true);
            expect(isRefreshOk).toEqual(true);
        });
    });
    // /SECTION

    // SECTION: getAllBecomeDoctorRequests
    describe("getAllBecomeDoctorRequests()", () => {
        // ANCHOR: should get 3 requests
        test("should get 3 users", async () => {
            //* Arrange
            const request1: BecomeDoctorObj = { ...sampleRequest };
            const request2: BecomeDoctorObj = {
                ...sampleRequest,
                name: "Максим",
                email: "mail1@mail.com",
            };
            const request3: BecomeDoctorObj = {
                ...sampleRequest,
                name: "Евгений",
                email: "mail2@mail.com",
            };

            //* Act
            // Test 1 user
            expect(await BecomeDoctorRequest.find({})).toEqual([]);
            const create1 = await BecomeDoctorRequest.create(request1);
            const result1 = await adminServices.getAllBecomeDoctorsRequests();
            request1.id = String(create1._id);

            // Test 2 users
            const create2 = await BecomeDoctorRequest.create(request2);
            const result2 = await adminServices.getAllBecomeDoctorsRequests();
            request2.id = String(create2._id);

            // Test 3 users
            const create3 = await BecomeDoctorRequest.create(request3);
            const result3 = await adminServices.getAllBecomeDoctorsRequests();
            request3.id = String(create3._id);

            // Prepare answers
            const answer1: BecomeDoctorObj[] = [request1];
            const answer2: BecomeDoctorObj[] = [request1, request2];
            const answer3: BecomeDoctorObj[] = [request1, request2, request3];

            //* Assert
            expect(result1).toEqual(answer1);
            expect(result2).toEqual(answer2);
            expect(result3).toEqual(answer3);
        });

        // ANCHOR: shouldn't get request after deleting
        test("shouldn't get user after deleting", async () => {
            //* Arrange
            const answer: [] = [];

            //* Act
            const { _id } = await BecomeDoctorRequest.create(sampleRequest);
            await BecomeDoctorRequest.remove({ _id: _id });

            const result = await adminServices.getAllBecomeDoctorsRequests();

            //* Assert
            expect(result).toEqual(answer);
        });

        // ANCHOR: should get updated request
        /** Create and update user. Function must return array with updated user */
        test("should get updated user", async () => {
            //* Given
            const updatedUser: BecomeDoctorObj = {
                ...sampleRequest,
                name: "Максим",
            };

            //* Result
            const { _id } = await BecomeDoctorRequest.create(sampleRequest);
            await BecomeDoctorRequest.updateOne({ _id: _id }, updatedUser);

            updatedUser.id = String(_id);
            const answer: BecomeDoctorObj[] = [updatedUser];

            const result = await adminServices.getAllBecomeDoctorsRequests();

            //* Checking

            expect(result).toEqual(answer);
        });
    });
    // /SECTION

    // SECTION: removeBecomeDoctorRequest()
    describe("removeBecomeDoctorRequest()", () => {
        // ANCHOR: should remove sample request
        test("should remove sample request", async () => {
            //* Arrange
            const { _id } = await BecomeDoctorRequest.create(sampleRequest);

            //* Act
            const ok = await adminServices.removeBecomeDoctorRequest(
                String(_id)
            );

            //* Assert
            expect(ok).toEqual(true);
            const requests = await BecomeDoctorRequest.find({});
            expect(requests).toEqual([]);
        });

        // ANCHOR: should return false on not existing id provide
        test("should return false on not existing id provide", async () => {
            //* Arrange
            const id = "123";

            //* Act
            const ok = await adminServices.removeBecomeDoctorRequest(id);

            //* Assert
            expect(ok).toEqual(false);
            const requests = await BecomeDoctorRequest.find({});
            expect(requests).toEqual([]);
        });

        // ANCHOR: should remove only one request
        test("should remove only one request", async () => {
            //* Arrange
            const { _id } = await BecomeDoctorRequest.create(sampleRequest);
            await BecomeDoctorRequest.create(sampleRequest);
            await BecomeDoctorRequest.create(sampleRequest);

            //* Act
            const ok = await adminServices.removeBecomeDoctorRequest(
                String(_id)
            );

            //* Assert
            expect(ok).toEqual(true);
            const requests = await BecomeDoctorRequest.find({});
            expect(requests.length).toEqual(2);
        });
    });
    // /SECTION
});
