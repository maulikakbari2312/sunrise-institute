import { Box, Button, CircularProgress, Grid } from '@mui/material';
import AddButton from 'component/AddButton/AddButton';
import { useApi } from 'network/api';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { modelData, totalRowsCount } from 'store/action';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import CommonTable from 'component/CommonTable/CommonTable';
import { Field, Form, Formik } from 'formik';
import { CustomSelectComponent, InputDateField, InputField, InputRadioGroup } from 'component/InputFiled';
function Enroll() {
    const { getApi, postApi } = useApi();
    const [data, setData] = useState(null);
    const [course, setCourse] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const [btnDisable, setBtnDisable] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector(state => state.user.isAdmin);
    const [isUser, setIsUser] = useState(user);
    const isBranch = useSelector((state) => state.user?.userBranch);
    const isAdmin = useSelector((state) => state.user?.isAdmin);

    useEffect(() => {
        setIsUser(user);
    }, [user]);
    const selected = useSelector((state) => state.selected);
    const [isFetch, setIsFetch] = useState(false);
    const putUrl = "/api/enroll/editEnroll"
    const deleteUrl = "/api/enroll/deleteEnroll"
    const model = {
        btnTitle: "Enroll",
        page: "Enroll",
        fieldData: [
            {
                name: "Name",
                type: "text",
            },
            {
                name: "course",
                type: "selectBox",
                modelNone: true,
            },
            {
                name: "Enroll Date",
                type: "text",
                modelNone: true,
                isNotRequired: true,
            },
            {
                name: "Payment Slip Number",
                type: "redioEnroll",
            },
            {
                name: "Payment Type",
                type: "redioEnroll",
            },
            {
                name: "Total Fees",
                type: "number",
            },
            {
                name: "Discount",
                type: "number",
            },
            {
                name: "Pay Fees",
                type: "number",
            },
            {
                name: "Partial Payment",
                type: "number",
                isNotRequired: true,
                modelNone: true,
            },
            {
                name: "Pending Fees",
                type: "number",
                isNotRequired: true,
                modelNone: true,
            },
            {
                name: "installment",
                type: "number",
                isNotRequired: true,
            },
            {
                name: "Pay Installment",
                type: "number",
                isNotRequired: true,
            },
            {
                name: "Installment Date",
                type: "date",
            },
            {
                name: "Payment Receiver",
                type: "text",
                isNotRequired: true,
                modelNone: true,
                displayNone: true,
            },
            {
                name: "Payment Details",
                type: "text",
                isNotRequired: true,
                modelNone: true,
                displayNone: true,
            },
            {
                name: "Student Gst",
                type: "text",
                isNotRequired: true,
                modelNone: true,
                // displayNone: true,
            },
            {
                name: "Enquire Branch",
                type: "text",
                modelNone: true
            },
            {
                name: "Enquire Type",
                type: "text",
                modelNone: true
            },
        ]
    }

    const fetchData = async () => {
        setBtnDisable(true);
        // // setIsLoading(true);
        try {
            const url = `${process.env.REACT_APP_HOST}/api/enroll/findEnroll`
            const response = await getApi(url);
            setData(response?.pageItems);
            setIsFetch(false);
            setIsLoading(false);
            dispatch(totalRowsCount(response?.total || 0));
            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
        } catch (error) {
            setIsLoading(false);
            setIsError(true);
            setIsFetch(false);
            setError(error);
            toast.error(error?.message || "Please Try After Sometime");
            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
        }
    };

    const fetchCourse = async () => {
        try {
            const url = `${process.env.REACT_APP_HOST}/api/admin/courseList`
            const response = await getApi(url);
            if (response?.pageItems && Array.isArray(response.pageItems)) {
                const courseTypes = response.pageItems.map(course => course.courseName);
                setCourse(courseTypes);
            }
        } catch (error) {
            toast.error(error?.message || "Please Try After Sometime");
        }
    }

    useEffect(() => {
        if (isFetch == true) {
            setIsFetch(false);
            fetchData();
        }
    }, [isFetch, selected.isEdit]);
    useEffect(() => {
        fetchData();
        dispatch(modelData(model));
        fetchCourse();
    }, []);

    const filterEmptyValues = (obj) => {
        const filteredObj = {};

        for (const key in obj) {
            if (obj[key] !== null && obj[key] !== undefined) {
                if (Array.isArray(obj[key]) && obj[key].length > 0) {
                    filteredObj[key] = obj[key];
                } else if (!Array.isArray(obj[key]) && obj[key] !== '') {
                    filteredObj[key] = obj[key];
                }
            }
        }

        return filteredObj;
    };

    return (
        <Box display="flex" flexDirection="column">
            <Formik
                initialValues={{
                    name: '',
                    course: '',
                    totalFees: '',
                    paymentType: '',
                    installment: '',
                    installmentDate: '',
                    discount: '',
                    payFees: '',
                    // gstBranch: '',
                    enquireBranch: '',
                    enquireType: '',
                }}

                onSubmit={(values, { setSubmitting }) => {
                    (async () => {
                        setBtnDisable(true);
                        // // setIsLoading(true);
                        try {
                            const filteredValues = filterEmptyValues(values);
                            const url = `${process.env.REACT_APP_HOST}/api/enroll/findFilterEnroll`
                            const response = await postApi(url, filteredValues);
                            setData(response?.pageItems);
                            setIsFetch(false);
                            // setIsLoading(false)
                            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                            setSubmitting(false); // Enable buttons after API call completes (success or failure)
                        } catch (error) {
                            setIsError(true);
                            setIsFetch(false);
                            setError(error);
                            toast.error(error?.message || "Please Try After Sometime");
                            setBtnDisable(false); // Enable buttons after API call completes (success or failure)
                        }
                    })()
                }}
            >
                {(values) => (
                    <Form>
                        <Grid container spacing={1}>
                            <Grid item xs={12} lg={3} sm={6} md={4} >
                                <Field
                                    name="name"
                                    render={({ form }) => (
                                        <InputField
                                            name="name"
                                            placeholder="Enter Full Name"
                                            form={form}
                                            type="name"
                                        />
                                    )}
                                />
                                {/* Add other InputFields for additional form fields */}
                            </Grid>
                            <Grid item xs={12} lg={3} sm={6} md={4} >
                                <Field
                                    name='course'
                                    render={({ field, form }) => (
                                        <CustomSelectComponent
                                            name='course'
                                            label='Course'
                                            placeholder={`Enter Course`}
                                            form={form}
                                            field={field}
                                            options={course}
                                        />
                                    )}
                                />
                                {/* Add other InputFields for additional form fields */}
                            </Grid>
                            <Grid item xs={12} lg={3} sm={6} md={4} >
                                <Field
                                    name="totalFees"
                                    render={({ form }) => (
                                        <InputField
                                            name="totalFees"
                                            placeholder="Enter Total Fees"
                                            form={form}
                                            type="number"
                                        />
                                    )}
                                />
                                {/* Add other InputFields for additional form fields */}
                            </Grid>
                            <Grid item xs={12} lg={3} sm={6} md={4} >
                                <Field
                                    name="paymentType"
                                    render={({ form }) => (
                                        <InputRadioGroup
                                            name="paymentType"
                                            form={form}
                                            label="payment Type"
                                            options={[
                                                { value: 'fullFees', label: 'Full Fees' },
                                                { value: 'installment', label: 'installment' },
                                            ]}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} lg={3} sm={6} md={4} >
                                <Field
                                    name="installment"
                                    render={({ form }) => (
                                        <InputField
                                            name="installment"
                                            placeholder="Enter Installment"
                                            form={form}
                                            type="number"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} lg={3} sm={6} md={4} >
                                <Field
                                    name="installmentDate"
                                    render={({ form }) => (
                                        <InputDateField
                                            name="installmentDate"
                                            placeholder="Enter Fees Date"
                                            form={form}
                                            type="date"
                                            valueDate={form?.values?.installmentDate}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} lg={3} sm={6} md={4}>
                                <Field
                                    name="discount"
                                    render={({ field, form }) => (
                                        <InputField
                                            name="discount"
                                            label="Discount"
                                            placeholder="Enter Discount"
                                            form={form}
                                            field={field}
                                            type='number'
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} lg={3} sm={6} md={4}>
                                <Field
                                    name="payFees"
                                    render={({ field, form }) => (
                                        <InputField
                                            name="payFees"
                                            label="Pay Fees"
                                            placeholder="Enter Pay Fees"
                                            form={form}
                                            field={field}
                                            type='number'
                                        />
                                    )}
                                />
                            </Grid>
                            {isUser === "master" &&
                                <Grid item xs={12} lg={3} sm={6} md={4}>
                                    <Field
                                        name="enquireBranch"
                                        render={({ form }) => (
                                            <Field
                                                name='enquireBranch'
                                                render={({ field, form }) => (
                                                    <CustomSelectComponent
                                                        name='enquireBranch'
                                                        label='Enter Enquire Branch'
                                                        placeholder={`Enter Enquire Branch`}
                                                        form={form}
                                                        field={field}
                                                        options={[{
                                                            label: "Abrama, Mota Varachha",
                                                            value: "Abrama, Mota Varachha"
                                                        },
                                                        {
                                                            label: "Sita Nagar",
                                                            value: "Sita Nagar"
                                                        },
                                                        {
                                                            label: "ABC, Mota Varachha",
                                                            value: "ABC, Mota Varachha"
                                                        }]}
                                                    />
                                                )}
                                            />
                                        )}
                                    />
                                </Grid>
                            }

                            {/* <Grid item xs={12} lg={3} sm={6} md={4}>
                                <Field
                                    name="gstBranch"
                                    render={({ form }) => (
                                        <Field
                                            name='gstBranch'
                                            render={({ field, form }) => (
                                                <CustomSelectComponent
                                                    name='gstBranch'
                                                    label='Enter GST Branch'
                                                    placeholder={`Enter GST Branch`}
                                                    form={form}
                                                    field={field}
                                                    options={[{
                                                        label: "Abrama, Mota Varachha",
                                                        value: "Abrama, Mota Varachha"
                                                    },
                                                    {
                                                        label: "Sita Nagar",
                                                        value: "Sita Nagar"
                                                    },
                                                    {
                                                        label: "ABC, Mota Varachha",
                                                        value: "ABC, Mota Varachha"
                                                    }]}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </Grid> */}
                        </Grid>
                        <Grid container justifyContent="flex-end" marginTop={2}>
                            <Button type="submit" disabled={btnDisable} variant="contained" color="primary" sx={{ marginRight: 2 }}>
                                Filter
                            </Button>
                            <Field
                                name="reset"
                                render={({ form }) => (
                                    <Button
                                        type="reset"
                                        variant="contained"
                                        color="secondary"
                                        disabled={selected.isEdit && btnDisable}
                                        onClick={() => { form && form.resetForm(); fetchData(); }}
                                    >
                                        Reset
                                    </Button>
                                )}
                            />
                        </Grid>
                    </Form>
                )}
            </Formik>
            <Box display="flex" flexDirection="column">
                <Formik
                    initialValues={{
                        startDate: '',
                        endDate: '',
                        course: '',
                        paymentType: '',
                        enquireType: ''
                    }}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        setBtnDisable(true);
                        try {
                            const urls = `${process.env.REACT_APP_HOST}/api/enroll/download-enroll-data/${isAdmin}/${isBranch}`;
                            const response = await fetch(urls, {
                                method: 'POST',
                                body: JSON.stringify(values),
                                headers: {
                                    'Content-type': 'application/json',
                                    'authorization': localStorage.getItem('token')
                                }
                            });

                            if (!response.ok) {
                                throw new Error('Failed to download file');
                            }

                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `enrollData-${values.startDate || new Date().toISOString().slice(0, 10)} to ${values?.endDate || new Date().toISOString().slice(0, 10)}.xlsx`;
                            document.body.appendChild(a);
                            a.click();
                            // Cleanup
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                            setBtnDisable(false); // Re-enable the button regardless of success or failure
                            resetForm();
                        } catch (error) {
                            toast.error(error?.message || "Please Try After Sometime");
                            setBtnDisable(false); // Re-enable the button regardless of success or failure
                            console.error(error);
                            // Handle error: You might want to show a notification to the user
                        }
                    }}

                >
                    {(values) => (
                        <Form>
                            {(isUser === "master" || isUser == 'true' || isUser == true) &&
                                <Grid container spacing={1} mt={3}>
                                    <Grid item xs={12} lg={3} sm={6} md={4} >
                                        <Field
                                            name="startDate"
                                            render={({ form }) => (
                                                <InputDateField
                                                    name="startDate"
                                                    placeholder="Enter Start Date"
                                                    form={form}
                                                    type="date"
                                                />
                                            )}
                                        />
                                        {/* Add other InputFields for additional form fields */}
                                    </Grid>
                                    <Grid item xs={12} lg={3} sm={6} md={4} >
                                        <Field
                                            name='endDate'
                                            render={({ field, form }) => (
                                                <InputDateField
                                                    name="endDate"
                                                    placeholder="Enter End Date"
                                                    form={form}
                                                    type="date"
                                                />
                                            )}
                                        />
                                        {/* Add other InputFields for additional form fields */}
                                    </Grid>
                                    <Grid item xs={12} lg={3} sm={6} md={4} >
                                        <Field
                                            name="enquireType"
                                            render={({ field, form }) => (
                                                <CustomSelectComponent
                                                    name="enquireType"
                                                    label="Select Enquire Type"
                                                    placeholder={`Enter Enquire Type`}
                                                    form={form}
                                                    field={field}
                                                    options={[
                                                        {
                                                            label: 'Immigration',
                                                            value: 'Immigration'
                                                        },
                                                        {
                                                            label: 'Competitive Exam',
                                                            value: 'CompetitiveExam'
                                                        },
                                                        {
                                                            label: 'It Courses',
                                                            value: 'ItCourses'
                                                        },
                                                    ]}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} lg={3} sm={6} md={4} >
                                        <Field
                                            name="paymentType"
                                            render={({ field, form }) => (
                                                <CustomSelectComponent
                                                    name="paymentType"
                                                    label="Select Payment Type"
                                                    placeholder={`Enter Payment Type`}
                                                    form={form}
                                                    field={field}
                                                    options={[
                                                        {
                                                            label: 'FullFees',
                                                            value: 'fullFees'
                                                        },
                                                        {
                                                            label: 'Installment',
                                                            value: 'installment'
                                                        },
                                                    ]}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} lg={3} sm={6} md={4} >
                                        <Field
                                            name="course"
                                            render={({ field, form }) => (
                                                <CustomSelectComponent
                                                    name="course"
                                                    label="Select Course"
                                                    placeholder={`Enter Course`}
                                                    form={form}
                                                    field={field}
                                                    options={course}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} lg={3} sm={6} md={4} >
                                        <Grid container justifyContent="flex-start" marginTop={2} marginLeft={2}>
                                            <Button type="submit" disabled={btnDisable} variant="contained" color="primary" sx={{ marginRight: 2 }}>
                                                Download
                                            </Button>
                                            <Field
                                                name="reset"
                                                render={({ form }) => (
                                                    <Button
                                                        type="reset"
                                                        variant="contained"
                                                        color="secondary"
                                                        disabled={selected.isEdit && btnDisable}
                                                        onClick={() => { form && form.resetForm(); }}
                                                    >
                                                        Reset
                                                    </Button>
                                                )}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            }
                        </Form>
                    )}
                </Formik>
            </Box>
            <Box display="flex" flexDirection="column" className='enroll'>
                {isLoading == true ?
                    <Box display="flex" justifyContent="center" alignItems="center" textAlign="center" w="100%" mt={{ "xl": "40px", "sm": "10px" }}>
                        <CircularProgress />
                    </Box>
                    :
                    <Box mt="25px">
                        <CommonTable
                            data={data}
                            isLoading={isLoading}
                            isError={isError}
                            error={error}
                            page="Enroll"
                            tableTitle="Enroll Student"
                            url={putUrl}
                            deleteUrl={deleteUrl}
                            setIsFetch={setIsFetch}
                            toast={toast}
                        />
                    </Box>
                }
            </Box>
            <ToastContainer autoClose={1500} />
        </Box >
    )
}

export default Enroll