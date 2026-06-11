import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
import { BMI_STATUS, RESIDENT_GENDER_TEXT2 } from "@/constants";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, usePage, useForm } from "@inertiajs/react";
import { useEffect } from "react";
import { Toaster, toast } from "sonner";
import ChildHealthMonitoringForm from "./Partials/ChildMonitoringForm";

export default function Create({ residents }) {
    const breadcrumbs = [
        { label: "Medical Information", showOnMobile: false },
        {
            label: "Child Health Monitoring Records",
            showOnMobile: false,
            href: route("child_record.index"),
        },
        { label: "Add Child Health Record", showOnMobile: true },
    ];

    const props = usePage().props;
    const success = props?.success ?? null;
    const error = props?.error ?? null;

    const { data, setData, post, errors, reset, processing } = useForm({
        resident_id: null,
        resident_name: "",
        birthdate: "",
        sex: "",
        age: "",
        age_in_months: "",
        resident_image: null,

        weight_kg: "",
        height_cm: "",
        bmi: "",
        head_circumference: "",
        nutrition_status: "",
        developmental_milestones: "",
        vaccinations: [{ vaccine: "", vaccination_date: "" }],
    });

    const vaccineList = [
        { label: "BCG", value: "BCG" },
        { label: "Hepatitis B", value: "Hepatitis B" },
        { label: "Pentavalent Vaccine", value: "Pentavalent Vaccine" },
        { label: "Oral Polio Vaccine", value: "Oral Polio Vaccine" },
        {
            label: "Inactivated Polio Vaccine",
            value: "Inactivated Polio Vaccine",
        },
        {
            label: "Pneumococcal Conjugate Vaccine",
            value: "Pneumococcal Conjugate Vaccine",
        },
        { label: "Measles, Mumps, Rubella", value: "MMR" },
        {
            label: "Measles Containing Vaccine",
            value: "Measles Containing Vaccine",
        },
    ];

    const calculateBMIAndStatus = (weightKg, heightCm, age, sex) => {
        if (!weightKg || !heightCm || age === "" || age === null) {
            return { bmi: null, status: "" };
        }

        const heightM = Number(heightCm) / 100;
        const bmi = Number(weightKg) / (heightM * heightM);
        let status = "";

        if (age >= 20) {
            if (bmi < 18.5) status = BMI_STATUS.underweight;
            else if (bmi <= 24.9) status = BMI_STATUS.normal;
            else if (bmi <= 29.9) status = BMI_STATUS.overweight;
            else status = BMI_STATUS.obese;
        } else if (age >= 5) {
            if (bmi < 15) status = BMI_STATUS.severely_underweight;
            else if (bmi < 19) status = BMI_STATUS.normal;
            else if (bmi < 23) status = BMI_STATUS.overweight;
            else status = BMI_STATUS.obese;
        } else {
            if (bmi < 13) status = BMI_STATUS.severely_underweight;
            else if (bmi < 14) status = BMI_STATUS.underweight;
            else if (bmi <= 18) status = BMI_STATUS.normal;
            else if (bmi <= 20) status = BMI_STATUS.overweight;
            else status = BMI_STATUS.obese;
        }

        return {
            bmi: Number(bmi.toFixed(2)),
            status,
        };
    };

    const handleResidentChange = (residentId) => {
        const resident = residents.find(
            (r) => String(r.id) === String(residentId),
        );

        if (!resident) return;

        let age = "";
        let ageInMonths = "";

        if (resident.birthdate) {
            const birthDate = new Date(resident.birthdate);
            const today = new Date();

            age = today.getFullYear() - birthDate.getFullYear();

            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();

            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                age--;
            }

            ageInMonths =
                (today.getFullYear() - birthDate.getFullYear()) * 12 +
                (today.getMonth() - birthDate.getMonth());

            if (today.getDate() < birthDate.getDate()) {
                ageInMonths--;
            }
        }

        const weightKg = resident.medical_information?.weight_kg || "";
        const heightCm = resident.medical_information?.height_cm || "";
        const sex = resident.sex || "";

        const { bmi, status } = calculateBMIAndStatus(
            weightKg,
            heightCm,
            age,
            sex,
        );

        setData((prev) => ({
            ...prev,
            resident_id: resident.id,
            resident_name:
                `${resident.firstname} ${resident.middlename || ""} ${resident.lastname} ${resident.suffix || ""}`.trim(),
            birthdate: resident.birthdate || "",
            sex,
            age,
            age_in_months: ageInMonths,
            resident_image: resident.resident_picture_path || null,
            weight_kg: weightKg,
            height_cm: heightCm,
            bmi,
            nutrition_status: status,
            vaccinations:
                resident.vaccinations?.length > 0
                    ? resident.vaccinations.map((v) => ({
                          vaccine: v.vaccine || "",
                          vaccination_date: v.vaccination_date || "",
                      }))
                    : [{ vaccine: "", vaccination_date: "" }],
        }));
    };

    const residentsList = residents.map((res) => ({
        label: `${res.firstname} ${res.middlename || ""} ${res.lastname} ${res.suffix || ""}`.trim(),
        value: String(res.id),
    }));

    const onSubmit = (e) => {
        e.preventDefault();

        post(route("child_record.store"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Child health record saved successfully.", {
                    description: "The record has been added.",
                    duration: 3000,
                    closeButton: true,
                });
            },
            onError: (errors) => {
                const errorList = Object.values(errors)
                    .map((msg) => `<div>${msg}</div>`)
                    .join("");

                toast.error("Validation Error", {
                    description: (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: errorList,
                            }}
                        />
                    ),
                    duration: 4000,
                    closeButton: true,
                });
            },
        });
    };

    useEffect(() => {
        if (!data.weight_kg || !data.height_cm) {
            setData((prev) => ({
                ...prev,
                bmi: null,
                nutrition_status: "",
            }));

            return;
        }

        const { bmi, status } = calculateBMIAndStatus(
            data.weight_kg,
            data.height_cm,
            data.age,
            data.sex,
        );

        setData((prev) => ({
            ...prev,
            bmi,
            nutrition_status: status,
        }));
    }, [data.weight_kg, data.height_cm, data.age, data.sex]);

    useEffect(() => {
        if (success) {
            toast.success(success, {
                description: "Operation successful!",
                duration: 3000,
                closeButton: true,
            });
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            toast.error(error, {
                description: "Operation failed!",
                duration: 3000,
                closeButton: true,
            });
        }
    }, [error]);

    return (
        <AdminLayout>
            <Toaster richColors />

            <Head title="Medical Information - Create Record" />

            <BreadCrumbsHeader breadcrumbs={breadcrumbs} />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <ChildHealthMonitoringForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    residentsList={residentsList}
                    vaccineList={vaccineList}
                    handleResidentChange={handleResidentChange}
                    RESIDENT_GENDER_TEXT2={RESIDENT_GENDER_TEXT2}
                    onSubmit={onSubmit}
                    onReset={() => reset()}
                    submitLabel="Submit"
                    toast={toast}
                />
            </div>
        </AdminLayout>
    );
}
