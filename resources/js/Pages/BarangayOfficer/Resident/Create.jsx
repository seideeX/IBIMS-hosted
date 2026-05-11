// import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
// import AdminLayout from "@/Layouts/AdminLayout";
// import { Head, usePage } from "@inertiajs/react";
// import { useState, useEffect } from "react";
// import Stepper from "@/Components/Stepper";
// import StepperController from "@/Components/StepperControler";
// import Address from "@/Components/FormSteps/Address";
// import HouseholdPersonalInfo from "@/Components/FormSteps/HouseholdPersonalInfo";
// import { StepperContext } from "@/context/StepperContext";
// import Summary from "@/Components/FormSteps/Summary";
// import EducationandOccupation from "@/Components/FormSteps/EducationandOccupation";
// import HouseInformation from "@/Components/FormSteps/HouseInformation";
// import MedicalInfo from "@/Components/FormSteps/MedicalInfo";
// import { router } from "@inertiajs/react";
// import { Toaster, toast } from "sonner";
// import useAppUrl from "@/hooks/useAppUrl";
// import Population from "@/Components/CRAsteps/Population";
// export default function Index({ puroks, streets, barangays, occupationTypes }) {
//     const breadcrumbs = [
//         { label: "Residents Information", showOnMobile: false },
//         {
//             label: "Residents Table",
//             href: route("resident.index"),
//             showOnMobile: false,
//         },
//         { label: "Add Household", showOnMobile: true },
//     ];

//     const [currentStep, setCurrentStep] = useState(1);
//     const [userData, setUserData] = useState({
//         toilets: [{ toilet_type: "" }],
//         electricity_types: [{ electricity_type: "" }],
//         water_source_types: [{ water_source_type: "" }],
//         waste_management_types: [{ waste_management_type: "" }],
//     });
//     const [finalData, setFinalData] = useState([]);
//     const [errors, setErrors] = useState({});

//     const steps = [
//         "Address Information",
//         "Household Information",
//         "Education & Occupation",
//         "Medical Information",
//         "House Information",
//         "Summary",
//     ];

//     const displayStep = (step) => {
//         switch (step) {
//             case 1:
//                 return <Address puroks={puroks} streets={streets} />;
//             case 2:
//                 return <HouseholdPersonalInfo barangays={barangays} />;
//             case 3:
//                 return (
//                     <EducationandOccupation occupationTypes={occupationTypes} />
//                 );
//             case 4:
//                 return <MedicalInfo />;
//             case 5:
//                 return <HouseInformation />;
//             case 6:
//                 return <Summary streets={streets} />;
//             default:
//         }
//     };

//     const handleClick = (direction) => {
//         let newStep = currentStep;

//         if (direction === "next") {
//             if (currentStep === steps.length) {
//                 router.post(route("resident.storehousehold"), userData, {
//                     onError: (errors) => {
//                         setErrors(errors);

//                         const allErrors = Object.values(errors).join("<br />");

//                         toast.error("Validation Errors", {
//                             description: (
//                                 <div
//                                     dangerouslySetInnerHTML={{
//                                         __html: allErrors,
//                                     }}
//                                 />
//                             ),
//                             duration: 5000,
//                             closeButton: true,
//                         });
//                     },
//                 });

//                 return;
//             }

//             newStep++;
//         } else {
//             newStep--;
//         }

//         if (newStep > 0 && newStep <= steps.length) {
//             setCurrentStep(newStep);
//         }
//     };

//     const props = usePage().props;
//     const success = props?.success ?? null;
//     const error = props?.error ?? null;
//     const APP_URL = useAppUrl();

//     useEffect(() => {
//         if (success) {
//             toast.success(success, {
//                 description: "Operation successful!",
//                 duration: 3000,
//                 closeButton: true,
//             });
//         }
//         props.success = null;
//     }, [success]);

//     useEffect(() => {
//         if (error) {
//             toast.error(error, {
//                 description: "Operation failed!",
//                 duration: 3000,
//                 closeButton: true,
//             });
//         }
//         props.error = null;
//     }, [error]);

//     return (
//         <AdminLayout>
//             <Toaster richColors />
//             <Head title="Resident Dashboard" />
//             <BreadCrumbsHeader breadcrumbs={breadcrumbs} />
//             <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 mt-6">
//                 <div className="bg-blue-100 rounded-t-xl px-2 sm:px-6 lg:px-8 py-2 border-gray-200 shadow-lg">
//                     <Stepper steps={steps} currentStep={currentStep} />
//                 </div>

//                 <div className="overflow-hidden bg-white border border-gray-200 rounded-b-xl p-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
//                     <div className="my-2 pb-5 pr-5 pl-5 pt-0">
//                         <StepperContext.Provider
//                             value={{
//                                 userData,
//                                 setUserData,
//                                 finalData,
//                                 setFinalData,
//                                 errors,
//                                 setErrors,
//                             }}
//                         >
//                             {displayStep(currentStep)}
//                         </StepperContext.Provider>
//                     </div>
//                 </div>

//                 <div className="mt-5">
//                     <StepperController
//                         handleClick={handleClick}
//                         currentStep={currentStep}
//                         steps={steps}
//                         userData={userData}
//                     />
//                 </div>
//             </div>
//         </AdminLayout>
//     );
// }

import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import Stepper from "@/Components/Stepper";
import StepperController from "@/Components/StepperControler";
import Address from "@/Components/FormSteps/Address";
import HouseholdPersonalInfo from "@/Components/FormSteps/HouseholdPersonalInfo";
import { StepperContext } from "@/context/StepperContext";
import Summary from "@/Components/FormSteps/Summary";
import EducationandOccupation from "@/Components/FormSteps/EducationandOccupation";
import HouseInformation from "@/Components/FormSteps/HouseInformation";
import MedicalInfo from "@/Components/FormSteps/MedicalInfo";
import { Toaster, toast } from "sonner";
import useAppUrl from "@/hooks/useAppUrl";

export default function Index({ puroks, streets, barangays, occupationTypes }) {
    const breadcrumbs = [
        { label: "Residents Information", showOnMobile: false },
        {
            label: "Residents Table",
            href: route("resident.index"),
            showOnMobile: false,
        },
        { label: "Add Household", showOnMobile: true },
    ];

    const [currentStep, setCurrentStep] = useState(1);
    const [userData, setUserData] = useState({
        toilets: [{ toilet_type: "" }],
        electricity_types: [{ electricity_type: "" }],
        water_source_types: [{ water_source_type: "" }],
        waste_management_types: [{ waste_management_type: "" }],
    });
    const [finalData, setFinalData] = useState([]);
    const [errors, setErrors] = useState({});

    const steps = [
        "Address Information",
        "Household Information",
        "Education & Occupation",
        "Medical Information",
        "House Information",
        "Summary",
    ];

    // 🔹 Restore form data and step from localStorage
    // useEffect(() => {
    //     const savedData = localStorage.getItem("householdFormData");
    //     const savedStep = localStorage.getItem("currentStep");

    //     if (savedData) setUserData(JSON.parse(savedData));
    //     if (savedStep) setCurrentStep(Number(savedStep));
    // }, []);

    // 🔹 Save form data and current step automatically
    useEffect(() => {
        localStorage.setItem("householdFormData", JSON.stringify(userData));
    }, [userData]);

    useEffect(() => {
        localStorage.setItem("currentStep", currentStep);
    }, [currentStep]);

    const displayStep = (step) => {
        switch (step) {
            case 1:
                return <Address puroks={puroks} streets={streets} />;
            case 2:
                return <HouseholdPersonalInfo barangays={barangays} />;
            case 3:
                return (
                    <EducationandOccupation occupationTypes={occupationTypes} />
                );
            case 4:
                return <MedicalInfo />;
            case 5:
                return <HouseInformation />;
            case 6:
                return <Summary streets={streets} />;
            default:
                return null;
        }
    };

    const handleClick = (direction) => {
        let newStep = currentStep;

        if (direction === "next") {
            if (currentStep === steps.length) {
                router.post(route("resident.storehousehold"), userData, {
                    onSuccess: () => {
                        toast.success(
                            "Household data submitted successfully!",
                            {
                                duration: 3000,
                                closeButton: true,
                            },
                        );

                        // ✅ Clear form and localStorage
                        localStorage.removeItem("householdFormData");
                        localStorage.removeItem("currentStep");

                        setUserData({
                            toilets: [{ toilet_type: "" }],
                            electricity_types: [{ electricity_type: "" }],
                            water_source_types: [{ water_source_type: "" }],
                            waste_management_types: [
                                { waste_management_type: "" },
                            ],
                        });

                        setCurrentStep(1);
                    },
                    onError: (errors) => {
                        setErrors(errors);
                        const allErrors = Object.values(errors).join("<br />");
                        toast.error("Validation Errors", {
                            description: (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: allErrors,
                                    }}
                                />
                            ),
                            duration: 5000,
                            closeButton: true,
                        });
                    },
                });

                return;
            }

            newStep++;
        } else {
            newStep--;
        }

        if (newStep > 0 && newStep <= steps.length) {
            setCurrentStep(newStep);
        }
    };

    const props = usePage().props;
    const success = props?.success ?? null;
    const error = props?.error ?? null;
    const APP_URL = useAppUrl();

    useEffect(() => {
        if (success) {
            toast.success(success, {
                description: "Operation successful!",
                duration: 3000,
                closeButton: true,
            });
        }
        props.success = null;
    }, [success]);

    useEffect(() => {
        if (error) {
            toast.error(error, {
                description: "Operation failed!",
                duration: 3000,
                closeButton: true,
            });
        }
        props.error = null;
    }, [error]);

    return (
        <AdminLayout>
            <Toaster richColors />
            <Head title="Resident Dashboard" />
            <BreadCrumbsHeader breadcrumbs={breadcrumbs} />

            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 mt-6">
                <div className="bg-blue-100 rounded-t-xl px-2 sm:px-6 lg:px-8 py-2 border-gray-200 shadow-lg">
                    <Stepper steps={steps} currentStep={currentStep} />
                </div>

                <div className="overflow-hidden bg-white border border-gray-200 rounded-b-xl p-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
                    <div className="my-2 pb-5 pr-5 pl-5 pt-0">
                        <StepperContext.Provider
                            value={{
                                userData,
                                setUserData,
                                finalData,
                                setFinalData,
                                errors,
                                setErrors,
                            }}
                        >
                            {displayStep(currentStep)}
                        </StepperContext.Provider>
                    </div>
                </div>
                <div className="my-5">
                    <StepperController
                        handleClick={handleClick}
                        currentStep={currentStep}
                        steps={steps}
                        userData={userData}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
