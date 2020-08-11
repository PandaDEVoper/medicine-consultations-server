/// <reference path="../declaration/mongoose-extended-schema.d.ts" />

import { Types } from "mongoose";
import Doctor, { BecomeDoctorRequest } from "../models/doctor";

// types
import { DoctorObject, IDoctor, BecomeDoctorObj } from "../types/models";

import {
    TValidateDoctor,
    TDoctorValidationErrors,
    TValidationErrorType,
    ESpeciality,
    TCreateDoctor,
    TUpdateDoctor,
    TRemoveDoctor,
    TGetOneDoctor,
    TSaveBecomeDoctorRequest,
    IGetDoctorsFilter,
    EWorkExperience,
    EWorkPlan,
    IGetDoctorsFilterQuery,
    MWorkExperience,
} from "../types/services";

// Services
import UserServices from "./user_services";
import {
    IDoctorToDoctorObj,
    consistingOf,
    validateByEnum,
} from "./types_services";
import logger from "../logger";
import { query } from "express";

class DoctorServices {
    // ANCHOR: validate doctor
    validate = async (
        doctor: any,
        needUnique: boolean = true
    ): Promise<TValidateDoctor> => {
        if (!doctor) {
            return {
                success: false,
                errors: {},
            };
        }

        // Doctor model is extended from User model,
        // so, if obj is not validate as user this will never validated as doctor
        const response = await UserServices.validateUser(doctor, needUnique);

        if (!response.success) {
            return {
                success: false,
                errors: response.errors,
            };
        }

        let errors: TDoctorValidationErrors = {};
        const ErrorType = TValidationErrorType;

        // Education
        if (!doctor.education) {
            errors.education = ErrorType.RequiredError;
        } else if (typeof doctor.education !== "string") {
            errors.education = ErrorType.TypeError;
        }

        // Year education
        if (!doctor.yearEducation) {
            errors.yearEducation = ErrorType.RequiredError;
        } else if (typeof doctor.yearEducation !== "string") {
            errors.yearEducation = ErrorType.TypeError;
        }

        // Blanck series
        if (!doctor.blankSeries) {
            errors.blankSeries = ErrorType.RequiredError;
        } else if (typeof doctor.blankSeries !== "string") {
            errors.blankSeries = ErrorType.TypeError;
        }

        // Blanck number
        if (!doctor.blankNumber) {
            errors.blankNumber = ErrorType.RequiredError;
        } else if (typeof doctor.blankNumber !== "string") {
            errors.blankNumber = ErrorType.TypeError;
        }

        // issueDate
        if (!doctor.issueDate) {
            errors.issueDate = ErrorType.RequiredError;
        } else {
            if (typeof doctor.issueDate !== "string") {
                errors.issueDate = ErrorType.TypeError;
            }
        }

        // Speciality
        if (doctor.speciality !== undefined && doctor.speciality !== null) {
            if (!Array.isArray(doctor.speciality)) {
                errors.speciality = ErrorType.TypeError;
            } else {
                for (let i = 0; i < doctor.speciality.length; i++) {
                    if (
                        !Object.keys(ESpeciality).includes(doctor.speciality[i])
                    ) {
                        errors.speciality = ErrorType.TypeError;
                        break;
                    }
                }
            }
        } else errors.speciality = ErrorType.RequiredError;

        // beginDoctorDate
        if (doctor.beginDoctorDate) {
            if (!(doctor.beginDoctorDate instanceof Date)) {
                errors.beginDoctorDate = ErrorType.TypeError;
            }
        } else errors.beginDoctorDate = ErrorType.RequiredError;

        // experience
        if (doctor.experience) {
            if (typeof doctor.experience !== "number") {
                errors.experience = ErrorType.TypeError;
            } else if (doctor.experience < 0) {
                errors.experience = ErrorType.TypeError;
            }
        } else errors.experience = ErrorType.RequiredError;

        // rating
        if (doctor.rating) {
            if (typeof doctor.rating !== "number") {
                errors.rating = ErrorType.TypeError;
            } else if (doctor.rating < 0 || doctor.rating > 5) {
                errors.rating = ErrorType.TypeError;
            }
        } else errors.rating = ErrorType.RequiredError;

        // whosFavourite
        if (doctor.whosFavourite) {
            if (!Array.isArray(doctor.whosFavourite)) {
                errors.whosFavourite = ErrorType.TypeError;
            } else {
                for (let i = 0; i < doctor.whosFavourite.length; i++) {
                    if (!Types.ObjectId.isValid(doctor.whosFavourite[i])) {
                        errors.whosFavourite = ErrorType.TypeError;
                        break;
                    }
                }
            }
        } else errors.whosFavourite = ErrorType.RequiredError;

        // clientsReviews
        if (
            doctor.clientsReviews !== undefined &&
            doctor.clientsReviews !== null
        ) {
            if (!Array.isArray(doctor.clientsReviews)) {
                errors.clientsReviews = ErrorType.TypeError;
            }
        } else errors.clientsReviews = ErrorType.RequiredError;

        // clientConsultations
        if (
            doctor.clientsConsultations !== undefined &&
            doctor.clientsConsultations !== null
        ) {
            if (!Array.isArray(doctor.clientsConsultations)) {
                errors.clientsConsultations = ErrorType.TypeError;
            }
        } else errors.clientsConsultations = ErrorType.RequiredError;

        // sheldure
        if (doctor.sheldure) {
            if (!Array.isArray(doctor.sheldure)) {
                errors.sheldure = ErrorType.TypeError;
            }
        } else errors.sheldure = ErrorType.RequiredError;

        if (Object.keys(errors).length == 0) {
            return {
                success: true,
            };
        } else {
            return {
                success: false,
                errors,
            };
        }
    };

    // ANCHOR: create doctor
    create = async (data: DoctorObject): Promise<TCreateDoctor> => {
        // validate doctor type
        const response = await this.validate(data);

        if (!response.success || response.errors === {}) {
            logger.w(`user is not validated, errors=${response.errors}`);
            return {
                success: false,
                error: "not_validated_error",
                errors: response.errors,
                message: "User is not validated",
            };
        }

        const doctor: IDoctor = new Doctor(data);

        if (!doctor) {
            logger.w(`created doctor is null data = ${data}`);
            return {
                success: false,
                error: "created_doctor_is_null",
                message: "Created doctor is null",
            };
        }

        // save doctor to db
        await doctor.save();

        logger.i(`successfully create doctor with id ${doctor._id}`);

        return {
            success: true,
            doctor: IDoctorToDoctorObj(doctor),
        };
    };

    // ANCHOR: update doctor
    update = async (data: DoctorObject): Promise<TUpdateDoctor> => {
        const validation = await this.validate(data, false);

        if (!validation.success) {
            logger.w(`user is not validated, errors=${validation.errors}`);
            return {
                success: false,
                error: "not_validated_error",
                validationErrors: validation.errors,
                message: "Passing doctor object is not validated",
            };
        }

        try {
            const updated: IDoctor | null = await Doctor.findOneAndUpdate(
                { _id: data.id },
                data,
                { new: true }
            );

            if (!updated) {
                logger.w(
                    `Updated user is null. User with id=${data.id} does not exist`
                );
                return {
                    success: false,
                    error: "updated_doctor_is_null",
                    message: `Updated user is null. User with id=${data.id} does not exist`,
                };
            }

            return {
                success: true,
                doctor: IDoctorToDoctorObj(updated),
            };
        } catch (e) {
            logger.e(e, e.stack);
            return {
                success: false,
                error: "invalid_error",
                message: "Invalid error happened",
            };
        }
    };

    // ANCHOR: remove doctor
    delete = async (id: string | Types.ObjectId): Promise<TRemoveDoctor> => {
        const doctor: IDoctor | null = await Doctor.findOne({
            _id: id,
        });

        // no doctor found
        if (!doctor) {
            logger.w(`No user found with id = ${id}`);
            return {
                success: false,
                error: "no_doctor_found",
                message: `No user found with id = ${id}`,
            };
        }

        let error: any;
        let removed: IDoctor | undefined | null;

        // remove doctor
        removed = await doctor.deleteOne();

        // error
        if (error) {
            logger.e(error, error.trace);
            return {
                success: false,
                error: "invalid_error",
                message: `invalid error when doctor.remove()`,
            };
        }

        if (removed) {
            logger.i(`successfully remove user with id=${removed.id}`);
            return {
                success: true,
                doctor: IDoctorToDoctorObj(removed),
            };
        } else {
            logger.w(`Removed user is null, id=${id}`);
            return {
                success: false,
                error: "removed_doctor_is_null",
                message: "Removed user is null",
            };
        }
    };

    // ANCHOR: get one
    getOne = async (id: string | Types.ObjectId): Promise<TGetOneDoctor> => {
        if (!Types.ObjectId.isValid(id)) {
            logger.w(`Invalid Id were provide, id=${id}`);
            return {
                success: false,
                error: "no_doctor_found",
                message: "Invalid Id were provide",
            };
        }

        const doctor: IDoctor | null = await Doctor.findById(id);

        if (!doctor) {
            logger.w(`No doctor found, id=${id}`);
            return {
                success: false,
                error: "no_doctor_found",
                message: "Invalid Id were provide",
            };
        }

        logger.i(`successfully get user, id=${id}`);
        return {
            success: true,
            doctor: IDoctorToDoctorObj(doctor),
        };
    };

    // ANCHOR: get all
    getAll = async (rawFilter?: any): Promise<DoctorObject[]> => {
        // handle filter
        const filter: IGetDoctorsFilter = this.handleRawGetAllFilter(rawFilter);

        // convert filter --> mongoose query
        const queryFilter: IGetDoctorsFilterQuery = {};

        //* Speciality
        if (filter.speciality) {
            queryFilter.speciality = {
                $all: filter.speciality,
            };
        }

        //* Experience
        if (filter.experience) {
            const queries = filter.experience.map((e) => {
                const area = MWorkExperience[e];
                return {
                    experience: { $gte: area[0], $lte: area[1] ?? undefined },
                };
            });

            if (queryFilter.$or) {
                queryFilter.$or = queryFilter.$or.concat(queries);
            } else {
                queryFilter.$or = queries;
            }
        }

        //* ServiceExperience
        if (filter.serviceExperience) {
            const queries = filter.serviceExperience.map((e) => {
                const area = MWorkExperience[e];
                return {
                    serviceExperience: {
                        $gte: area[0],
                        $lte: area[1] ?? undefined,
                    },
                };
            });

            if (queryFilter.$or) {
                queryFilter.$or = queryFilter.$or.concat(queries);
            } else {
                queryFilter.$or = queries;
            }
        }

        //* Rating
        if (filter.rating) {
            const queries = filter.rating.map((e) => {
                return {
                    rating: { $gte: e, $lt: e + 1 },
                };
            });

            if (queryFilter.$or) {
                queryFilter.$or = queryFilter.$or.concat(queries);
            } else {
                queryFilter.$or = queries;
            }
        }

        //* Sex
        if (typeof filter.sex === "boolean") {
            queryFilter.sex = filter.sex;
        }

        //* City
        if (filter.city) {
            queryFilter.city = {
                $in: filter.city,
            };
        }

        //* WorkPlan
        if (filter.workPlan) {
            queryFilter.workPlan = {
                $in: filter.workPlan,
            };
        }

        //* IsChild
        if (typeof filter.isChild === "boolean") {
            queryFilter.isChild = filter.isChild;
        }

        //* IsAdult
        if (typeof filter.isAdult === "boolean") {
            queryFilter.isAdult = filter.isAdult;
        }

        const raw = await Doctor.find(queryFilter);
        return raw.map((e) => IDoctorToDoctorObj(e));
    };

    // ANCHOR: save become doctor request
    saveBecomeDoctorRequest = async (
        request: BecomeDoctorObj
    ): Promise<TSaveBecomeDoctorRequest> => {
        try {
            const email = request.email;

            if (email) {
                const founded = await BecomeDoctorRequest.find({ email });

                if (founded.length >= 3) {
                    logger.i(
                        `Exceeded the limit of request per one email=${email} (3)`
                    );
                    return {
                        success: false,
                        error: "requests_limit_error",
                        message:
                            "Exceeded the limit of request per one email (3)",
                    };
                }
            } else {
                logger.i(`no email found, ignore become doctor request`);
                return {
                    success: true,
                };
            }

            await BecomeDoctorRequest.create(request);

            logger.i(`successfully save become doctor request for ${email}`);
            return {
                success: true,
            };
        } catch (e) {
            logger.e(e, e.trace);
            return {
                success: false,
                error: "invalid_error",
                message: "Invalid error happened",
            };
        }
    };

    handleRawGetAllFilter = (filter: any): IGetDoctorsFilter => {
        if (typeof filter !== "object" || !filter) {
            // TYPE_ERROR or EMPTY_FILTER_RESPONSE
            return {};
        }

        // This object will be our final filter config
        let config: IGetDoctorsFilter = {};

        //* Speciality?
        if (filter.speciality) {
            const field = validateByEnum<ESpeciality>(
                filter.speciality,
                ESpeciality
            );

            if (field) {
                config.speciality = field;
            }
        }

        //* Experience?
        if (filter.experience) {
            const field = validateByEnum<EWorkExperience>(
                filter.experience,
                EWorkExperience
            );

            if (field) {
                config.experience = field;
            }
        }

        //* ServiceExperience?
        if (filter.serviceExperience) {
            const field = validateByEnum<EWorkExperience>(
                filter.serviceExperience,
                EWorkExperience
            );

            if (field) {
                config.serviceExperience = field;
            }
        }

        //* Rating?
        if (filter.rating) {
            let submitted: number[] = [];
            filter.rating.forEach((element: any) => {
                if (
                    typeof element === "number" &&
                    element >= 0 &&
                    element <= 5
                ) {
                    submitted.push(element);
                }
            });

            if (submitted.length > 0) {
                config.rating = submitted;
            }
        }

        //* Sex?
        if (typeof filter.sex === "boolean") {
            config.sex = filter.sex;
        }

        //* City?
        if (filter.city && consistingOf(filter.city, "string")) {
            config.city = filter.city;
        }

        //* WorkPlan
        if (filter.workPlan) {
            const field = validateByEnum<EWorkPlan>(filter.workPlan, EWorkPlan);

            if (field) {
                config.workPlan = field;
            }
        }

        //* isChild
        if (typeof filter.isChild === "boolean") {
            config.isChild = filter.isChild;
        }

        //* isAdult
        if (typeof filter.isAdult === "boolean") {
            config.isAdult = filter.isAdult;
        }

        return config;
    };

    // ! This's using only for testing. DO NOT USE FOR PRODUCTION
    testHandleRawGetAllFilter = (
        filter: any
    ): IGetDoctorsFilter | undefined => {
        if (process.env.MODE === "testing") {
            return this.handleRawGetAllFilter(filter);
        }
    };
}

export default new DoctorServices();
