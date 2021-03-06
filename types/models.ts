import mongoose, { Document, Types } from "mongoose";
import { EWorkPlan } from "./services";

/**
 *  Refresh Token model interface
 */
export interface IRefreshToken extends Document {
    value: string;
}

/**
 *  User model interface with mongoose functions
 */
export interface IUser extends Document {
    fullName: string;
    name: string;
    surname: string;
    patronymic: string;
    age?: number;
    photoUrl: string;
    phone: number;
    email: string;
    password: string;
    sex: boolean;
    city?: string;
    country?: string;
    consultations:  (mongoose.Types.ObjectId | IConsultation)[];
    reviews: mongoose.Types.ObjectId[];
    notificationEmail: string;
    sendNotificationToEmail: boolean;
    sendMailingsToEmail: boolean;
    createdAt: Date;
    lastActiveAt: Date;
    favourites: mongoose.Types.ObjectId[];
    activeConsultations: (mongoose.Types.ObjectId | IConsultation)[];
    birthday?: Date;
    chatsWithHelpers: (mongoose.Types.ObjectId | ISupportChat)[];
    schedule: (mongoose.Types.ObjectId| IAppointment)[];
    consultationRequests: (mongoose.Types.ObjectId | IConsultationRequest)[];
    balance: number;
    transactionHistory: (mongoose.Types.ObjectId | ITransactionModel)[];
}

/**
 *  User object without mongoose functios
 */
export interface UserObject {
    id: IUser["_id"];
    fullName: IUser["fullName"];
    name: IUser["name"];
    surname: IUser["surname"];
    patronymic: IUser["patronymic"];
    photoUrl: IUser["photoUrl"];
    phone: IUser["phone"];
    email: IUser["email"];
    password: IUser["password"];
    sex: IUser["sex"];
    city?: IUser["city"];
    country?: IUser["country"];
    consultations: IUser["consultations"];
    reviews: IUser["reviews"];
    notificationEmail: IUser["notificationEmail"];
    sendNotificationToEmail: IUser["sendNotificationToEmail"];
    sendMailingsToEmail: IUser["sendMailingsToEmail"];
    createdAt: IUser["createdAt"];
    lastActiveAt: IUser["lastActiveAt"];
    favourites: IUser["favourites"];
    age?: IUser["age"];
    activeConsultations: IUser["activeConsultations"];
    birthday?: IUser['birthday'];
    chatsWithHelpers: IUser['chatsWithHelpers'];
    consultationRequests: IUser['consultationRequests']
    balance: IUser['balance']
    transactionHistory: IUser['transactionHistory']
    schedule: IUser['schedule']
}

/**
 * Doctor interface model
 */
export interface IDoctor extends IUser {
    _education: string;
    yearEducation: string;
    blankSeries: string;
    blankNumber: string;
    issueDate: string;
    speciality: string[];
    beginDoctorDate: Date;
    experience: number;
    serviceExperience: number;
    rating: number;
    whosFavourite: mongoose.Types.ObjectId[];
    passportIssuedByWhom: string;
    passportSeries: string;
    passportIssueDate: string;
    _workExperience: string;
    _workPlaces: string;
    qualification?: string;
    workPlan?: string;
    isChild?: boolean;
    isAdult?: boolean;
    vkLink?: string,
    instagramLink?: string,
    telegramLink?: string,
    whatsAppLink?: string,
    viberLink?: string,
    emailLink?: string,
    information?: string;
    price: number;
    workPlaces?: DoctorWorkplaceType[];
    education?: DoctorEducationType[];
    qualificationProofs?: DoctorQualificationDocumentType[];
    workingTime: DoctorWorkingType;
}

export interface DoctorObject extends UserObject {
    _education: IDoctor["_education"];
    yearEducation: IDoctor["yearEducation"];
    blankSeries: IDoctor["blankSeries"];
    blankNumber: IDoctor["blankNumber"];
    issueDate: IDoctor["issueDate"];
    speciality: IDoctor["speciality"];
    beginDoctorDate: IDoctor["beginDoctorDate"];
    experience: IDoctor["experience"];
    serviceExperience: IDoctor["serviceExperience"];
    rating: IDoctor["rating"];
    whosFavourite: IDoctor["whosFavourite"];
    schedule: IDoctor["schedule"];
    passportIssuedByWhom: IDoctor["passportIssuedByWhom"];
    passportSeries: IDoctor["passportSeries"];
    passportIssueDate: IDoctor["passportIssueDate"];
    _workExperience: IDoctor["_workExperience"];
    _workPlaces: IDoctor["_workPlaces"];
    qualification?: IDoctor["qualification"];
    workPlan?: EWorkPlan;
    isChild?: IDoctor["isChild"];
    isAdult?: IDoctor["isAdult"];
    vkLink?: IDoctor["vkLink"];
    instagramLink?: IDoctor["instagramLink"];
    telegramLink?: IDoctor["telegramLink"];
    whatsAppLink?: IDoctor["whatsAppLink"];
    viberLink?:IDoctor["viberLink"];
    emailLink?: IDoctor["emailLink"];
    information?: IDoctor['information'];
    price: IDoctor['price'];
    workPlaces?: IDoctor['workPlaces'];
    education?: IDoctor['education'];
    qualificationProofs?: IDoctor['qualificationProofs'];
    workingTime: IDoctor['workingTime'];
}

/**
 * This type used to describe doctor workplace
 */
export type DoctorWorkplaceType = {
    fromYear: number;
    toYear: number;
    organisation: string;
    speciality: string;
}

/**
 * This type used to describe doctor workplace
 */
export type DoctorEducationType = {
    year: number;
    institute: string;
    educationType: Education;
}

/**
 * This type used to describe doctor qualification document
 */
export type DoctorQualificationDocumentType = {
    imageUrl: string;
    name: string;
}

/**
 * This enum used to describe types of doctor education
 */
export enum Education {
    Baccalaureate,  // Бакалавриат
    Specialty,      // Специалитет
    Master,         // Магистратура
}

/**
 * This type used to describe doctor working time
 */
export type DoctorWorkingType = {
    from: {
        h: number,
        m: number,
    },
    to: {
        h: number,
        m: number,
    },
    consultationTimeInMin: number,
    consultationPauseInMin: number,
    weekends: number[],
}

/**
 * Doctor tile interface model
 */
export interface DoctorTile {
    name: string;
    surname: string;
    speciality: string[];
    age?: number;
    photoUrl: string;
    rating: number;
}

/**
 *  Consultation model interface
 */
export interface IConsultation extends Document {
    patient: Types.ObjectId | IUser;
    doctor: Types.ObjectId | IDoctor;
    date: Date;
    note?: string;
    messages: { message: string, userId: string }[];
    status: "not_started" | "waiting_for_doctor" | "started" | "finished",
    wroteReview: boolean,
    connectionHistory: ConnectionHistoryRecord[],
    audioRecords: string[],
}

export interface ConsultationObject {
    patient: IConsultation["patient"];
    doctor: IConsultation["doctor"];
    date: IConsultation["date"];
    note?: IConsultation["note"];
    messages: IConsultation["messages"];
    status: IConsultation["status"],
    wroteReview: IConsultation["wroteReview"],
    connectionHistory: IConsultation["connectionHistory"],
    audioRecords: string[],
}

export type ConnectionHistoryRecord = {
    action: ConnectionHistoryAction,
    who: Types.ObjectId | IUser | IDoctor,
    date: Date,
}

export enum ConnectionHistoryAction {
    Connected,
    Disconnected,
}

/**
 *  Consultation Request model interface
 */
export interface IConsultationRequest extends Document{
    patient: Types.ObjectId | IUser;
    doctor: Types.ObjectId | IDoctor;
    createdAt: Date;
    appointment: Types.ObjectId | IAppointment;
}

export interface ConsultationRequestObject {
    patient: IConsultationRequest['patient'];
    doctor: IConsultationRequest['doctor'];
    createdAt: IConsultationRequest['createdAt'];
    appointment: IConsultationRequest['appointment'];
}



/**
 * Review model interface
 */
export interface IReview extends Document {
    patientId: string;
    doctorId: string;
    content: string;
    point: number;
    timestamp: Date;
}

export interface ReviewObject {
    patientId: IReview["patientId"];
    doctorId: IReview["doctorId"];
    content: IReview["content"];
    point: IReview["point"];
    timestamp: IReview["timestamp"];
}

/**
 * Appointment model interface
 */
export interface IAppointment extends Document {
    from: Date;
    to: Date;
    consultation: Types.ObjectId | IConsultation;
    patientName: string;
    phone: number;
    birthday: Date;
    sex: boolean;
    chronicDiseases: string;
    symptoms: string;
    documents: ConsultationDocument[];
    numericDate: string;
}

export interface AppointmentObject {
    _id: string;
    from: IAppointment["from"];
    to: IAppointment["to"];
    consultation: IAppointment["consultation"];
    patientName: IAppointment["patientName"];
    phone: IAppointment["phone"];
    birthday: IAppointment["birthday"];
    sex: IAppointment["sex"];
    chronicDiseases: IAppointment["chronicDiseases"];
    symptoms: IAppointment["symptoms"];
    documents: IAppointment["documents"];
    numericDate: IAppointment["numericDate"];
}

/**
 * Consultation document object
 */
export type ConsultationDocument = {
    path: string;
    type: "img" | "pdf" | "file";
    size: string;
    name: string;
}

/**
 * Doctor Speciality model interface
 */
export interface ISpeciality extends Document {
    name: string;
}

/**
 *  Doctor Speciality object without mongoose functios
 */
export interface SpecialityType {
    name: ISpeciality["name"];
}

/**
 *  Become Doctor Request mongoose interface
 *  Send by client when user submit form to become a doctor
 */
export interface IBecomeDoctor extends Document {
    name: string;
    surname: string;
    phone: string;
    email: string;
    sex: boolean;
    password: string;
    education: string;
    speciality: string;
    yearEducation: string;
    blankSeries: string;
    blankNumber: string;
    issueDate: string;
    experience: string;
    passportIssuedByWhom: string;
    passportSeries: string;
    passportIssueDate: string;
    workExperience: string;
    workPlaces: string;
}

/**
 * Become Doctor Request Object
 */
export interface BecomeDoctorObj {
    id: string;
    name: IBecomeDoctor["name"];
    surname: IBecomeDoctor["surname"];
    phone: IBecomeDoctor["phone"];
    email: IBecomeDoctor["email"];
    sex: IBecomeDoctor["sex"];
    password: IBecomeDoctor["password"];
    education: IBecomeDoctor["education"];
    speciality: IBecomeDoctor["speciality"];
    yearEducation: IBecomeDoctor["yearEducation"];
    blankSeries: IBecomeDoctor["blankSeries"];
    blankNumber: IBecomeDoctor["blankNumber"];
    issueDate: IBecomeDoctor["issueDate"];
    experience: IBecomeDoctor["experience"];
    passportIssuedByWhom: IBecomeDoctor["passportIssuedByWhom"];
    passportSeries: IBecomeDoctor["passportSeries"];
    passportIssueDate: IBecomeDoctor["passportIssueDate"];
    workExperience: IBecomeDoctor["workExperience"];
    workPlaces: IBecomeDoctor["workPlaces"];
}

/**
 * Admin Role
 */
export enum AdminRole {
    King = "King",
    Admin = "admin",
    Developer = "Developer",
}

export interface IAdmin extends Document {
    id: string | Types.ObjectId;
    username: string;
    password: string;
    email: string;
    name: string;
    photoUrl: string;
    role: AdminRole;
}

export interface AdminObj {
    id?: IAdmin["id"];
    username: IAdmin["username"];
    password: IAdmin["password"];
    email: IAdmin["email"];
    name: IAdmin["name"];
    photoUrl: IAdmin["photoUrl"];
    role: IAdmin["role"];
}

export interface IAdminHistory extends Document {
    id: string | Types.ObjectId;
    adminId: string;
    whatDid: string;
    payload: string;
    timestamp: Date;
}

export interface AdminHistoryObject {
    id: IAdminHistory["id"];
    adminId: IAdminHistory["adminId"];
    whatDid: IAdminHistory["whatDid"];
    payload: Object;
    timestamp: IAdminHistory["timestamp"];
}

//========================================================================================
/*                                                                                      *
 *                                         MAILS                                        *
 *                                                                                      */
//========================================================================================

/**
 * This interface describe mongoose MailBlocks model
 */
export interface IMailBlocks extends Document {
    // email which services cant send mails
    email: string;
}

/**
 * This interface describe MailBlocks model
 */
export interface MailBlocksObject {
    email: IMailBlocks["email"];
}

/**
 * This interface describe mongoose ResetPasswordRequest model
 */
export interface IResetPasswordRequest extends Document {
    // id of sended user
    userId: String;

    // date of request creation
    timestamp: Date;
}

/**
 * This interface describe MailBlocks model
 */
export interface ResetPasswordRequestObject {
    userId: IResetPasswordRequest["userId"];
    timestamp: IResetPasswordRequest["timestamp"];
}

//========================================================================================
/*                                                                                      *
 *                                        PAYMENT                                       *
 *                                                                                      */
//========================================================================================

export interface IConsPayment extends Document {
    status: string;
    consultationId?: Types.ObjectId;
    paymentId: string;
    doctorId: Types.ObjectId;
    userId: Types.ObjectId;
    amount: number;
    info: string;
    createdAt: Date;
    payAt?: Date;
    canceledAt?: Date;
}

export interface ConsPaymentObj {
    status: "waiting" | "success" | "canceled";
    consultationId?: IConsPayment["consultationId"];
    paymentId: IConsPayment["paymentId"];
    doctorId: IConsPayment["doctorId"];
    userId: IConsPayment["userId"];
    amount: IConsPayment["amount"];
    info: IConsPayment["info"];
    createdAt: IConsPayment["createdAt"];
    payAt?: IConsPayment["payAt"];
    canceledAt?: IConsPayment["canceledAt"];
}

//========================================================================================
/*                                                                                      *
 *                                    SUPPORT                                           *
 *                                                                                      */
//========================================================================================

export interface ISupportChat extends Document {
    user: Types.ObjectId | IUser;
    messages: {
        content: string,
        isUser: boolean,
        date: Date,
    }[],
    title: string,
    timestamp: Date,
    problem: SupportProblemType,
    number: number;
    readByUser: boolean;
    readByAdmin: boolean;
    payload?: SupportChatPayload;
    closed: boolean;
}

export interface SupportChat {
    user: ISupportChat['user'];
    messages: ISupportChat['messages'];
    title: ISupportChat['title'];
    timestamp: ISupportChat['timestamp'];
    problem: ISupportChat['problem'];
    number: ISupportChat['number'];
    readByUser: ISupportChat['readByUser'];
    readByAdmin: ISupportChat['readByAdmin'];
    payload: ISupportChat["payload"];
    closed: ISupportChat["closed"];
}

export type SupportChatPayload = {
    consultationId?: string
}

export type SupportProblemType = "Tech" | "Doctor" | "Other";
export const SupportProblemArray: SupportProblemType[] = ["Tech", "Doctor", "Other"];

//========================================================================================
/*                                                                                      *
 *                                       PAYMENT                                        *
 *                                                                                      */
//========================================================================================

export enum TransactionDirection {
    "top_up" = "top_up",            // пополнение баланса
    "withdrawals" = "withdrawals",  // вывод с баланса
}

export enum PaymentMethod {
    "bank_card" = "bank_card",       // оплата произведена с карты
    "web_money" = "web_money",       // оплата произведена с Qiwi / Webmoney
    "web_bank" = "web_bank",         // оплата произведена с интернет банка (сбер, тинкофф...)
    "b2b" = "b2b",                   // оплата от коммерческих организаций
    "other" = "other",              // оплата другими способами (баланс телефона...)
}

export enum TransactionType {
    "bank_card" = "bank_card",
    "apple_pay" = "apple_pay",
    "google_pay" = "google_pay",
    "yoo_money" = "yoo_money",
    "qiwi" = "qiwi",
    "webmoney" = "webmoney",
    "sberbank" = "sberbank",
    "alfabank" = "alfabank",
    "tinkoff_bank" = "tinkoff_bank",
    "b2b_sberbank" = "b2b_sberbank",
    "mobile_balance" = "mobile_balance",
    "cash" = "cash",
    "installments" = "installments",
}

export enum TransactionStatus {
    "waiting_for_capture" = "waiting_for_capture",
    "succeeded" = "succeeded",
    "canceled" = "canceled"
}

export interface ITransactionModel extends Document {
    direction: TransactionDirection,
    date: Date,
    paymentMethod: PaymentMethod,
    transactionType: TransactionType,
    status: TransactionStatus,
    amount: number,
    bankDetails: string
}

export interface ITransaction {
    direction: ITransactionModel['direction'],
    date: ITransactionModel['date'],
    paymentMethod: ITransactionModel['paymentMethod'],
    transactionType: ITransactionModel['transactionType'],
    status: ITransactionModel['status'],
    amount: ITransactionModel['amount'],
    bankDetails: ITransactionModel['bankDetails'],
}
