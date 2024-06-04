const { default: mongoose } = require("mongoose");
const message = require("../../common/error.message");
const competitiveExamModel = require("../../model/Enquire/CompetitiveExam.model");
const enrollModel = require("../../model/enroll/enrollPayment.model");
const CompleteEnrollDetail = require("../../model/enroll/completeEnroll.model");
const DemoEnrollDetail = require("../../model/enroll/demoEnroll.medel");
function convertDateFormat(inputDate) {
    // Split the input date into year, month, and day
    var dateParts = inputDate.split('-');

    // Create a new Date object with the extracted parts
    var convertedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

    // Extract day, month, and year from the Date object
    var day = convertedDate.getDate();
    var month = convertedDate.getMonth() + 1; // Month is zero-based, so we add 1
    var year = convertedDate.getFullYear();

    // Format the date in DD/MM/YYYY
    var formattedDate = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year;

    return formattedDate;
}
const axios = require('axios');
const logInDetail = require("../../model/admin/login.model");
const SettleEnrollDetail = require("../../model/enroll/settleEnroll.model");
const paymentSlipDetail = require("../../model/enroll/paymentSlip.model");
const settlePaymentSlipDetail = require("../../model/enroll/settlePaymentSlip.model");
exports.createCompetitiveExamDetail = async (competitiveExam, isAdmin, isBranch) => {
    try {
        const user = await logInDetail.findOne({ email: competitiveExam.enquiryTokenBy });
        if (user) {
            competitiveExam.enquiryTokenBy = user.name;
        }
        competitiveExam.branch = isBranch;
        competitiveExam.enquire = 'CompetitiveExam';
        competitiveExam.dob = convertDateFormat(competitiveExam.dob);

        const createCompetitiveExamDetail = new competitiveExamModel(competitiveExam);
        try {
            const enrollMsg = `*GREETING FROM SUNRISE INSTITUTE*

OUR SERVICES ARE GIVEN BELOW:
*● ABROAD STUDY*
    -   IELTS | PTE | TOEFL
    -   SPOKEN ENGLISH
    -   STUDENT VISA

*● IT INSTITUTE*
    -   BCA | B.SC IT
    -   FULL STACK DEVELOPMENT
    -   WEB DESIGNING | UI/UX DESIGNING
    -   IOS | ANDROID | FLUTTER

*● COMPETITIVE EXAM*
    -   GPSC 1/2 | CLASS III
    -   PSI | CONSTABLE

WE HOPE YOU GET GREAT EXPERIENCE WITH US AND WE ARE ALWAYS THERE FOR GUIDANCE AND SUPPORT TOWARDS YOU.

*THANK YOU FOR CHOOSING OUR INSTITUTE*.`;
            const encodedMsg = encodeURIComponent(enrollMsg);
            const url = `${process.env.WHATSAPP_URL}?number=91${competitiveExam.mobileNumber}&type=text&message=${encodedMsg}&instance_id=${isBranch == 'Abrama, Mota Varachha' ? process.env.INSTANCE_ID_ABRAMA : isBranch == 'Sita Nagar' ? process.env.INSTANCE_ID_SITANAGER : process.env.INSTANCE_ID_ABC}&access_token=${process.env.ACCESS_TOKEN}`;
            // Make the HTTP POST request to send the birthday message
            await axios.post(url);

        } catch (error) {

        }
        const detail = await createCompetitiveExamDetail.save();
        return {
            status: 200,
            message: message.ENQUIRE_IMMIGRATION_CREATED,
        };
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};

exports.findCompetitiveExam = async (isAdmin, isBranch) => {
    try {
        let query = {};
        if (isAdmin !== 'master') {
            // If the user is not an admin, retrieve data based on the specified branch
            query = { branch: isBranch };
        }
        const getCompetitiveExam = await competitiveExamModel.find(query);
        if (!getCompetitiveExam) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND,
            };
        }
        const reversedCompetitiveExam = getCompetitiveExam.reverse();

        return reversedCompetitiveExam;
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};

exports.findFilterCompetitiveExam = async (body, isAdmin, isBranch) => {
    try {
        let query = {};

        // If the user is not an admin, retrieve data based on the specified branch
        if (isAdmin !== 'master') {
            query.branch = isBranch;
        }

        // Incorporate the values from the body into the query
        if (body && typeof body === 'object') {
            for (const key in body) {
                // Only include valid keys from the body
                if (body.hasOwnProperty(key)) {
                    if (key === 'name' && body.name) {
                        // Slice the name into space-separated parts
                        const names = body.name.split(' ');
                        // Create a regex to match each part of the sliced name
                        query[key] = { $all: names.map(name => new RegExp(name, 'i')) };
                    } else if (Array.isArray(body[key])) {
                        // Use $all operator to find documents where the specified array is a subset
                        query[key] = { $all: body[key].map(val => new RegExp(val, 'i')) };
                    } else {
                        // Use regex for case-insensitive matching
                        query[key] = new RegExp(body[key], 'i');
                    }
                }
            }
        }

        const getCompetitiveExam = await competitiveExamModel.find(query);

        if (!getCompetitiveExam || getCompetitiveExam.length === 0) {
            return {
                status: 404,
                message: message.COMPETITIVE_EXAM_NOT_FOUND,
            };
        }

        const reversedCompetitiveExam = getCompetitiveExam.reverse();

        return reversedCompetitiveExam;

    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};



exports.editCompetitiveExamDetail = async (data, token, isAdmin, isBranch) => {
    try {
        const enrollUser = await competitiveExamModel.findOne({ tokenId: token });
        if (enrollUser) {
            enrollUser.name = data?.name || enrollUser.name; // Use the existing name if data.name is not provided
            enrollUser.dob = data?.dob || enrollUser.dob;
            enrollUser.mobileNumber = data?.mobileNumber || enrollUser.mobileNumber;
            enrollUser.email = data?.email || enrollUser.email;
            await enrollUser.save(); // Await the save() method
        }
        const SettleEnroll = await SettleEnrollDetail.findOne({ tokenId: token });
        if (SettleEnroll) {
            SettleEnroll.name = data?.name || SettleEnroll.name; // Use the existing name if data.name is not provided
            SettleEnroll.dob = data?.dob || SettleEnroll.dob;
            SettleEnroll.mobileNumber = data?.mobileNumber || SettleEnroll.mobileNumber;
            SettleEnroll.email = data?.email || SettleEnroll.email;
            await SettleEnroll.save(); // Await the save() method
        }
        const enrollDetails = await enrollModel.findOne({ tokenId: token });
        if (enrollDetails) {
            enrollDetails.name = data?.name || enrollDetails.name; // Use the existing name if data.name is not provided
            enrollDetails.dob = data?.dob || enrollDetails.dob;
            enrollDetails.mobileNumber = data?.mobileNumber || enrollDetails.mobileNumber;
            enrollDetails.email = data?.email || enrollDetails.email;
            await enrollDetails.save(); // Await the save() method
        }

        // Update user details in 'CompleteEnrollDetail'
        const completeDetails = await CompleteEnrollDetail.findOne({ tokenId: token });
        if (completeDetails) {
            completeDetails.name = data?.name || completeDetails.name;
            completeDetails.dob = data?.dob || completeDetails.dob;
            completeDetails.mobileNumber = data?.mobileNumber || completeDetails.mobileNumber;
            completeDetails.email = data?.email || completeDetails.email;
            await completeDetails.save(); // Await the save() method
        }

        await paymentSlipDetail.updateMany({ tokenId: token }, { name: data.name });
        await settlePaymentSlipDetail.updateMany({ tokenId: token }, { name: data.name });
        data.dob = convertDateFormat(data.dob);

        const editCompetitiveExam = await competitiveExamModel.findOneAndUpdate(
            { tokenId: token },
            data,
            { new: true }
        );

        if (!editCompetitiveExam) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND,
            };
        }

        return {
            status: 200,
            message: message.IMMIGRATION_DATA_UPDATED,
        };
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};

exports.editStatusCompetitiveExamDetail = async (data, token) => {
    try {
        const enquireStatus = await competitiveExamModel.findOne({ tokenId: token });
        if (enquireStatus?.status == 'enroll') {
            return {
                status: 404,
                message: 'Unable to Change Status',
            };
        }
        if (data.status !== 'enroll') {
            // Check if tokenId exists in enrollModel and remove it
            await enrollModel.deleteOne({ tokenId: token });
            await CompleteEnrollDetail.deleteOne({ tokenId: token });
        }
        if (data.status !== 'demo') {
            // Check if tokenId exists in enrollModel and remove it
            await DemoEnrollDetail.deleteOne({ tokenId: token });
        }
        const editCompetitiveExam = await competitiveExamModel.findOneAndUpdate(
            { tokenId: token },
            { $set: data },
            { new: true }
        );

        if (!editCompetitiveExam) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND,
            };
        }

        return {
            status: 200,
            message: message.IMMIGRATION_DATA_UPDATED,
        };
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};

exports.deleteCompetitiveExamDetail = async (whereCondition) => {
    try {
        await enrollModel.deleteOne({ tokenId: whereCondition });
        await CompleteEnrollDetail.deleteOne({ tokenId: whereCondition });

        const deleteCompetitiveExam = await competitiveExamModel.deleteOne({
            tokenId: whereCondition,
        });
        if (!deleteCompetitiveExam) {
            return {
                status: 404,
                message: "Unable to delete competitiveExam",
            };
        }
        return {
            status: 200,
            message: message.IMMIGRATION_DELETE,
        };
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};
