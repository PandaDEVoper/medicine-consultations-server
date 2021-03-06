/// <reference types="../../node_modules/@types/jest/index" />

import mongoose from "mongoose";
import Doctor, { BecomeDoctorRequest } from "../../models/doctor";

// Testable
import doctorServices from "../../services/doctor_services";

// @types
import { DoctorObject, BecomeDoctorObj } from "../../types/models";
import {
    IDoctorToDoctorObj,
    DoctorObjToBecomeDoctorObj,
    IBecomeDoctorToBecomeDoctorObj,
} from "../../services/types_services";
import setupModels from "../../models";
import { EWorkPlan, EWorkExperience } from "../../types/services";
import { excludePassword } from "../helpers/password";

/**
 *  ? This test module testing doctor services
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
const sampleDoctor: DoctorObject = {
    id: undefined,
    name: "Иван",
    surname: "Иванов",
    patronymic: "Иванович",
    photoUrl: "",
    phone: 79028319028,
    email: "ivanov_ivan@mail.ru",
    password: "12345678",
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
    activeConsultations: [], // will add later
    experience: 364,
    favourites: [], // will add later
    rating: 4.6,
    schedule: [], // will add later
    speciality: ["Pediatrician", "Nutritionist"],
    whosFavourite: [], // will add later
    passportIssueDate: "21.11.2015",
    passportIssuedByWhom: "МВД г. Москвы",
    passportSeries: "123123",
    _workExperience: "1 год",
    _workPlaces: "Городская поликлиника №1 г. Москва",
    age: 35,
    isAdult: true,
    isChild: false,
    workPlan: EWorkPlan.Multiple,
    serviceExperience: 360,
    qualification: "first",
    fullName: "Иванов Иван Иванович",
    workingTime: {
        from: { h: 9, m: 0 },
        to: { h: 18, m: 0 },
        weekends: [5, 6],
        consultationTimeInMin: 60,
    },
    qualificationProofs: [],
    workPlaces: [],
    information: "Cool guy :)",
    education: [],
    birthday: new Date(),
    consultationRequests: [],
    price: 700,
};

const secondSampleUser = {
    ...sampleDoctor,
    fullName: "Егор Егоров Егорович",
    name: "Егор",
    surname: "Егоров",
    patronymic: "Егорович",
    email: "123@mail.com",
    experience: 1000,
    notificationEmail: "123@mail.com",
    speciality: [],
    whosFavourite: [], // will add later
    qualification: undefined,
    rating: 0,
    city: undefined,
    workPlan: undefined,
    isChild: undefined,
    isAdult: undefined,
};

setupModels();

describe("Test Doctor services", () => {
    let db: mongoose.Mongoose;

    // It's just so easy to connect to the MongoDB Memory Server
    // By using mongoose.connect
    beforeAll(async () => {
        db = await mongoose.connect(
            "mongodb://localhost/test-db",
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

    // Close MongoDB connection after all test cases have done
    afterAll(async () => {
        db.disconnect();
    });

    // Remove all date from mongodb after each test case
    afterEach(async () => {
        await Doctor.remove({});
        await BecomeDoctorRequest.remove({});
    });

    // SECTION: validate()
    describe("Validate doctor", () => {
        // ANCHOR: should validate sample doctor
        /** Validate sample doctor */
        test("should validate sample doctor", async () => {
            //* Act
            const response = await doctorServices.validate(sampleDoctor);

            //* Assert
            expect(response.errors).toBeUndefined();
            expect(response.success).toEqual(true);
        });

        // ANCHOR: shouldn't validate doctor with type errors
        /** Validate doctor with type errors */
        test("shouldn't validate type error", async () => {
            //* Arrange
            const errors = {
                speciality: "type_error",
                beginDoctorDate: "type_error",
                experience: "type_error",
                rating: "type_error",
                whosFavourite: "type_error",
                clientsReviews: "type_error",
                clientsConsultations: "type_error",
                schedule: "type_error",
            };

            const doctor = {
                ...sampleDoctor,
                speciality: 123,
                beginDoctorDate: 123,
                experience: "123",
                rating: 45,
                whosFavourite: 123,
                clientsReviews: 123,
                clientsConsultations: 123,
                schedule: 123,
            };

            //* Act
            const responce = await doctorServices.validate(doctor);

            //* Assert
            expect(responce.errors).toEqual(errors);
            expect(responce.success).toBe(false);
        });

        // ANCHOR: shouldn't validate required errors
        /**  Validate doctor with required  errors */
        test("shouldn't validate length errors", async () => {
            //* Arrange
            const errors = {
                speciality: "required_error",
                beginDoctorDate: "required_error",
                rating: "required_error",
                whosFavourite: "required_error",
                clientsReviews: "required_error",
                clientsConsultations: "required_error",
                schedule: "required_error",
            };

            const doctor = {
                ...sampleDoctor,
                speciality: undefined,
                beginDoctorDate: undefined,
                rating: undefined,
                whosFavourite: undefined,
                clientsReviews: undefined,
                clientsConsultations: undefined,
                schedule: undefined,
            };

            //* Act
            const responce = await doctorServices.validate(doctor);

            //* Assert
            expect(responce.errors).toEqual(errors);
            expect(responce.success).toBe(false);
        });
    });
    // /SECTION

    // SECTION: create()
    describe("Create Doctor", () => {
        // ANCHOR: should create sample doctor
        /** Create doctor using doctor service. Expect this doctor in db */
        test("should create sample doctor", async () => {
            //* Arrange
            const doctor = sampleDoctor;

            //* Act
            const responce = await doctorServices.create(sampleDoctor);
            doctor.id = responce?.doctor?.id;

            //* Assert
            expect(responce.success).toEqual(true);
            expect(responce.doctor).toEqual(doctor);
            expect(responce.error).toBeFalsy();
            expect(responce.errors).toBeFalsy();
            expect(responce.message).toBeFalsy();

            const doctors = (await Doctor.find({})).map((e) =>
                IDoctorToDoctorObj(e)
            );
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: shouldn't create dont'validated user
        /** Passing empty user in function. Expect errors */
        test("shouldn't create don`t validated user", async () => {
            //* Act
            // @ts-ignore
            const responce = await doctorServices.create({});

            //* Assert
            expect(responce.success).toEqual(false);
            expect(responce.doctor).toBeFalsy();
            expect(responce.error).toEqual("not_validated_error");
            expect(responce.errors).toBeTruthy();
            expect(responce.message).toBeTruthy();

            const users = await Doctor.find({});
            expect(users).toEqual([]);
        });
    });
    // /SECTION

    // SECTION: update()
    describe("Update Doctor", () => {
        // ANCHOR: should update sample user
        /** Create user using mongoose. Function should update his */
        test("should update sample user", async () => {
            //* Arrange
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id), name: "Максим" };

            //* Act
            const response = await doctorServices.update(doctor);

            //* Assert
            expect(response.error).toBeFalsy();
            expect(response.success).toBe(true);
            expect(response.doctor).toEqual(doctor);
            expect(response.validationErrors).toBeFalsy();

            const dbDoctor = IDoctorToDoctorObj(
                // @ts-ignore
                await Doctor.findOne({ _id })
            );
            expect(dbDoctor).toEqual(doctor);
        });

        // ANCHOR: shouldn't update not validated user
        /** Create user using mongoose. Function shouldn't update this user with invalid new */
        test("shouldn't update not validated user", async () => {
            //* Arrange
            const doctor = { ...sampleDoctor, clientsConsultations: 123 };
            const errors = { clientsConsultations: "type_error" };

            //* Act
            // @ts-ignore
            const response = await doctorServices.update(doctor);

            //* Assert
            expect(response.success).toBe(false);
            expect(response.error).toEqual("not_validated_error");
            expect(response.doctor).toBeUndefined();
            expect(response.validationErrors).toEqual(errors);
        });

        // ANCHOR: shouldn't update not existing doctor
        /** Pass not existing doctor. Function shouldn't update this doctor */
        test("shouldn't update not existing user", async () => {
            //* Arrange
            const doctor = { ...sampleDoctor, id: "123456789101" };

            //* Act
            const response = await doctorServices.update(doctor);

            //* Assert
            expect(response.success).toBe(false);
            expect(response.error).toEqual("updated_doctor_is_null");
            expect(response.doctor).toBeUndefined();
            expect(response.validationErrors).toBeUndefined();
        });
    });
    // /SECTION

    // SECTION: remove()
    describe("Remove doctor", () => {
        // ANCHOR: should remove sample doctor
        /** Create doctor using mongoose. Function should remove it */
        test("should remove sample doctor", async () => {
            //* Arrange
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };

            //* Act
            const responce = await doctorServices.delete(String(_id));

            //* Assert
            expect(responce.error).toBeUndefined();
            expect(responce.success).toEqual(true);
            expect(responce.doctor).toEqual(doctor);

            const doctors = await Doctor.find({});
            expect(doctors).toEqual([]);
        });

        // ANCHOR: should return error on not existing uid
        /** Pass invalid uid in function. Expect errors */
        test("should return error on not existing uid", async () => {
            //* Arrange
            const id = "imfakeuserid";

            //* Act
            const responce = await doctorServices.delete(id);

            //* Assert
            expect(responce.success).toEqual(false);
            expect(responce.error).toEqual("no_doctor_found");
            expect(responce.doctor).toBeUndefined();
            expect(responce.message).toBeDefined();
        });
    });
    // /SECTION

    // SECTION: getOne()
    describe("Get one doctor", () => {
        // ANCHOR: should get sample doctor
        test("should get sample doctor", async () => {
            //* Arrange
            const { _id } = await Doctor.create(sampleDoctor);
            let doctor = { ...sampleDoctor, id: String(_id) };

            //* Act
            const response = await doctorServices.getOne(_id);

            //* Assert
            doctor = excludePassword<DoctorObject>(doctor);
            expect(response).toEqual({ success: true, doctor });
        });

        // ANCHOR: should return error on unexisting doctor id
        test("should return error on unexisting doctor id", async () => {
            //* Arrange
            const id = "hiimdoctorid";

            //* Act
            const responce = await doctorServices.getOne(id);

            //* Assert
            expect(responce.success).toEqual(false);
            expect(responce.error).toEqual("no_doctor_found");
            expect(responce.message).toBeDefined();
        });
    });
    // /SECTION

    // SECTION: getAll()
    describe("getAll()", () => {
        // ANCHOR: should find with name filter
        test("should find with name filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                fullName: sampleDoctor.name,
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: should find with surname filter
        test("should find with surname filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                fullName: sampleDoctor.surname,
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: should find with patronymic filter
        test("should find with patronymic filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                fullName: sampleDoctor.patronymic,
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: should find with name & surname filter
        test("should find with name & surname filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                fullName: sampleDoctor.name + " " + sampleDoctor.surname,
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: should find with name & patronymic filter
        test("should find with name & patronymic filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                fullName: sampleDoctor.name + " " + sampleDoctor.patronymic,
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: should find with surname & patronymic filter
        test("should find with surname & patronymic filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                fullName: `${sampleDoctor.surname} ${sampleDoctor.patronymic}`,
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: should find with name, surname & patronymic filter
        test("should find with name, surname & patronymic filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                fullName:
                    sampleDoctor.surname +
                    " " +
                    sampleDoctor.patronymic +
                    " " +
                    sampleDoctor.name,
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: shouldn't find with name filter
        test("shouldn't find with name filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            await Doctor.create(sampleDoctor);
            const filter = {
                fullName: "123 123 123",
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([]);
        });

        // ANCHOR: should use isDownward=true filter
        test("should use isDownward=true filter", async () => {
            //* Arrange
            const thirdDoctor = {
                ...secondSampleUser,
                email: "hey@mail.com",
                notificationEmail: "hey@mail.com",
                rating: 2,
            };
            const res1 = await Doctor.create(sampleDoctor);
            const res2 = await Doctor.create(secondSampleUser);
            const res3 = await Doctor.create(thirdDoctor);

            const doctor = { ...sampleDoctor, id: String(res1._id) };
            const secondDoctor = {
                ...secondSampleUser,
                id: String(res2._id),
            };
            thirdDoctor.id = String(res3._id);

            const filter = {
                isDownward: true,
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors[0]).toEqual(doctor);
            expect(doctors[1]).toEqual(thirdDoctor);
            expect(doctors[2]).toEqual(secondDoctor);
        });

        // ANCHOR: should use isDownward=false filter
        test("should use isDownward=false filter", async () => {
            //* Arrange
            const thirdDoctor = {
                ...secondSampleUser,
                email: "hey@mail.com",
                notificationEmail: "hey@mail.com",
                rating: 2,
            };
            const res1 = await Doctor.create(sampleDoctor);
            const res2 = await Doctor.create(secondSampleUser);
            const res3 = await Doctor.create(thirdDoctor);

            const doctor = { ...sampleDoctor, id: String(res1._id) };
            const secondDoctor = {
                ...secondSampleUser,
                id: String(res2._id),
            };
            thirdDoctor.id = String(res3._id);

            const filter = {
                isDownward: false,
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors[0]).toEqual(secondDoctor);
            expect(doctors[1]).toEqual(thirdDoctor);
            expect(doctors[2]).toEqual(doctor);
        });

        // ANCHOR: should find with speciality filter
        test("should find with speciality filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                speciality: ["Pediatrician"],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: shouldn't find with speciality filter
        test("shouldn't find with speciality filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            await Doctor.create(sampleDoctor);
            const filter = {
                speciality: ["Therapist"],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([]);
        });

        // ANCHOR: shouldn't find with 1 valid & 1 invalid speciality filter
        test("shouldn't find with 1 valid & 1 invalid speciality filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            await Doctor.create(sampleDoctor);
            const filter = {
                speciality: ["Pediatrician", "Therapist"],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([]);
        });

        // ANCHOR: should find with experience filter
        test("should find with experience filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                experience: ["LessYear"],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: should find with multiple experience filter
        test("should find with multiple experience filter", async () => {
            //* Arrange
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                experience: [
                    "LessYear",
                    "OneYear",
                    "ThreeYears",
                    "FiveYears",
                    "MoreFiveYears",
                ],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: shouldn't find with experience filter
        test("shouldn't find with experience filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            await Doctor.create(sampleDoctor);
            const filter = {
                experience: ["FiveYears"],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([]);
        });

        // ANCHOR: should find with qualification filter
        test("should find with qualification filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                _qualification: ["first"],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: shouldn't find with qualification filter
        test("shouldn't find with qualification filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            await Doctor.create(sampleDoctor);
            const filter = {
                _qualification: ["second"],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([]);
        });

        // ANCHOR: should find with rating filter
        test("should find with rating filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                rating: [4],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: should find with multiple rating filters
        test("should find with multiple rating filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                rating: [1, 4, 5],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: shouldn't find with rating filter
        test("shouldn't find with rating filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            await Doctor.create(sampleDoctor);
            const filter = {
                rating: [3, 5],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([]);
        });

        // ANCHOR: should find with city filter
        test("should find with city filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                city: ["Москва"],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: should find with multiply city filter
        test("should find with multiply city filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                city: ["Москва", "Новосибирск"],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: shouldn't find with city filters
        test("shouldn't find with city filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            await Doctor.create(sampleDoctor);
            const filter = {
                city: ["Новосибирск"],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([]);
        });

        // ANCHOR: should find with work plan filter
        test("should find with work plan filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                workPlan: ["Multiple"],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: should find with multiple work plan filter
        test("should find with multiple work plan filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                workPlan: ["Multiple", "Single"],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: shouldn't find with work plan filter
        test("shouldn't find with work plan filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            await Doctor.create(sampleDoctor);
            const filter = {
                workPlan: ["Single"],
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([]);
        });

        // ANCHOR: should find with isChild filter
        test("should find with isChild filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                isChild: false,
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: shouldn't find with isChild filter
        test("shouldn't find with isChild filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            await Doctor.create(sampleDoctor);
            const filter = {
                isChild: true,
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([]);
        });

        // ANCHOR: should find with isAdult filter
        test("should find with isAdult filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };
            const filter = {
                isAdult: true,
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: shouldn't find with isAdult filter
        test("shouldn't find with isAdult filter", async () => {
            //* Arrange
            await Doctor.create(secondSampleUser);
            await Doctor.create(sampleDoctor);
            const filter = {
                isAdult: false,
            };

            //* Act
            const doctors = await doctorServices.getAll(filter);

            //* Assert
            expect(doctors).toEqual([]);
        });
    });
    // /SECTION

    // SECTION
    describe("save become doctor request", () => {
        const sampleRequest: BecomeDoctorObj = DoctorObjToBecomeDoctorObj(
            sampleDoctor
        );

        // ANCHOR: should save sample doctor request
        test("should save sample doctor request", async () => {
            //* Act
            const response = await doctorServices.saveBecomeDoctorRequest(
                sampleRequest
            );

            //* Assert
            expect(response).toEqual({ success: true });
            const raw = await BecomeDoctorRequest.find({});
            const answer = { ...sampleRequest, id: raw[0].id };
            const request = IBecomeDoctorToBecomeDoctorObj(raw[0]);

            expect(answer).toEqual(request);
        });

        // ANCHOR: should return error on exceeding the limit
        test("should return error on exceeding the limit", async () => {
            //* Arrange
            await BecomeDoctorRequest.create(sampleRequest);
            await BecomeDoctorRequest.create(sampleRequest);
            await BecomeDoctorRequest.create(sampleRequest);

            //* Act
            const response = await doctorServices.saveBecomeDoctorRequest(
                sampleRequest
            );

            //* Assert
            expect(response.success).toEqual(false);
            expect(response.error).toEqual("requests_limit_error");
            expect(response.message).toBeDefined();
            const raw = await BecomeDoctorRequest.find({});
            expect(raw.length).toEqual(3);
        });
    });
    // /SECTION

    // SECTION: handleRawGetAllFilter()
    describe("handleRawGetAllFilter()", () => {
        // ANCHOR: should pass fullName filter
        test("should pass fullName filter", () => {
            //* Act
            const filter = {
                fullName: "Hey",
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual(filter);
        });

        // ANCHOR: shouldn't pass fullName filter
        test("shouldn't pass fullName filter", () => {
            //* Act
            const filter = {
                fullName: [true],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual({});
        });

        // ANCHOR: should pass downward filter
        test("should pass fullName filter", () => {
            //* Act
            const filter = {
                isDownward: true,
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual(filter);
        });

        // ANCHOR: shouldn't pass isDownward filter
        test("shouldn't pass isDownward filter", () => {
            //* Act
            const filter = {
                isDownward: ["123"],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual({});
        });

        // ANCHOR: should pass speciality
        test("should pass speciality", async () => {
            //* Act
            const filter = {
                speciality: ["Pediatrician"],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual(filter);
        });

        // ANCHOR: shouldn't pass speciality
        test("shouldn't pass speciality", async () => {
            //* Act
            const filter = {
                speciality: ["123"],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual({});
        });

        // ANCHOR: should pass experience
        test("should pass experience", async () => {
            //* Act
            const filter = {
                experience: [EWorkExperience.LessYear],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual(filter);
        });

        // ANCHOR: shouldn't pass experience
        test("shouldn't pass experience", async () => {
            //* Act
            const filter = {
                experience: ["123"],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual({});
        });

        // ANCHOR: should pass qualification
        test("shouldn't pass experience", async () => {
            //* Act
            const filter = {
                _qualification: ["first"],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual(filter);
        });

        // ANCHOR: should pass qualification
        test("shouldn't pass experience", async () => {
            //* Act
            const filter = {
                _qualification: ["123"],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual({});
        });

        // ANCHOR: should pass rating
        test("should pass rating", async () => {
            //* Act
            const filter = {
                rating: [5],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual(filter);
        });

        // ANCHOR: shouldn't pass rating bigger than 5
        test("shouldn't pass rating", async () => {
            //* Act
            const filter = {
                rating: [123],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual({});
        });

        // ANCHOR: shouldn't pass rating less than 0
        test("shouldn't pass rating", async () => {
            //* Act
            const filter = {
                rating: [-1],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual({});
        });

        // ANCHOR: shouldn't pass rating with incorrect type
        test("shouldn't pass rating", async () => {
            //* Act
            const filter = {
                rating: [123],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual({});
        });

        // ANCHOR: should pass city
        test("should pass city", async () => {
            //* Act
            const filter = {
                city: ["Москва"],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual(filter);
        });

        // ANCHOR: shouldn't pass city
        test("shouldn't pass city", async () => {
            //* Act
            const filter = {
                city: [123],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual({});
        });

        // ANCHOR: should pass workPlan
        test("should pass workPlan", async () => {
            //* Act
            const filter = {
                workPlan: [EWorkPlan.Single],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual(filter);
        });

        // ANCHOR: shouldn't pass workPlan
        test("shouldn't pass workPlan", async () => {
            //* Act
            const filter = {
                workPlan: ["123"],
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual({});
        });

        // ANCHOR: should pass isChild
        test("should pass isChild", async () => {
            //* Act
            const filter = {
                isChild: false,
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual(filter);
        });

        // ANCHOR: shouldn't pass isChild
        test("shouldn't pass isChild", async () => {
            //* Act
            const filter = {
                isChild: 123,
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual({});
        });

        // ANCHOR: should pass isAdult
        test("should pass isAdult", async () => {
            //* Act
            const filter = {
                isAdult: false,
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual(filter);
        });

        // ANCHOR: shouldn't pass isAdult
        test("shouldn't pass isAdult", async () => {
            //* Act
            const filter = {
                isAdult: 123,
            };
            const cfg = doctorServices.testHandleRawGetAllFilter(filter);

            //* Arrange
            expect(cfg).toEqual({});
        });
    });
    // /SECTION
});
