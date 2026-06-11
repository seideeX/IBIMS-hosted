import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
import { BMI_STATUS, RESIDENT_GENDER_TEXT2 } from "@/constants";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, usePage, useForm } from "@inertiajs/react";
import { useEffect } from "react";
import { Toaster, toast } from "sonner";
import ChildHealthMonitoringForm from "./Partials/ChildMonitoringForm";

export default function Edit({ record }) {
    const breadcrumbs = [
        { label: "Medical Information", showOnMobile: false },
        {
            label: "Child Health Monitoring Records",
            showOnMobile: false,
            href: route("child_record.index"),
        },
        { label: "Edit Child Health Record", showOnMobile: true },
    ];

    const props = usePage().props;
    const success = props?.success ?? null;
    const error = props?.error ?? null;

    const computeAge = (birthdate) => {
        if (!birthdate) return "";

        const birthDate = new Date(birthdate);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return age;
    };

    const computeAgeInMonths = (birthdate) => {
        if (!birthdate) return "";

        const birthDate = new Date(birthdate);
        const today = new Date();

        let months =
            (today.getFullYear() - birthDate.getFullYear()) * 12 +
            (today.getMonth() - birthDate.getMonth());

        if (today.getDate() < birthDate.getDate()) {
            months--;
        }

        return months;
    };

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

    const initialAge = computeAge(record.resident?.birthdate);
    const initialAgeInMonths = computeAgeInMonths(record.resident?.birthdate);

    const { data, setData, post, errors, reset, processing } = useForm({
        id: record.id,
        resident_id: record.resident_id ?? null,

        resident_name: record.resident
            ? `${record.resident.firstname} ${
                  record.resident.middlename || ""
              } ${record.resident.lastname} ${
                  record.resident.suffix || ""
              }`.trim()
            : "",

        birthdate: record.resident?.birthdate ?? "",
        sex: record.resident?.sex ?? "",
        age: initialAge,
        age_in_months: initialAgeInMonths,
        resident_image: record.resident?.resident_picture_path ?? null,

        weight_kg: record.resident?.medical_information?.weight_kg ?? "",
        height_cm: record.resident?.medical_information?.height_cm ?? "",
        bmi: record.resident?.medical_information?.bmi ?? "",

        head_circumference: record.head_circumference ?? "",
        nutrition_status:
            record.nutrition_status ??
            record.resident?.medical_information?.nutrition_status ??
            "",

        developmental_milestones: record.developmental_milestones ?? "",
        immunizations_updated: record.immunizations_updated ?? "",

        vaccinations:
            record.resident?.vaccinations?.length > 0
                ? record.resident.vaccinations.map((v) => ({
                      id: v.id,
                      vaccine: v.vaccine || "",
                      vaccination_date: v.vaccination_date || "",
                  }))
                : [{ vaccine: "", vaccination_date: "" }],

        _method: "PUT",
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

    const onSubmit = (e) => {
        e.preventDefault();

        post(route("child_record.update", data.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Child health record updated successfully.", {
                    description: "The record changes have been saved.",
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

            <Head title="Medical Information - Edit Record" />

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
                    residentsList={[
                        {
                            label: data.resident_name,
                            value: String(data.resident_id),
                        },
                    ]}
                    vaccineList={vaccineList}
                    handleResidentChange={() => {}}
                    RESIDENT_GENDER_TEXT2={RESIDENT_GENDER_TEXT2}
                    onSubmit={onSubmit}
                    onReset={() => reset()}
                    submitLabel="Update"
                    title="Edit Child Health Monitoring"
                    description="Update the child’s growth measurements, health details, developmental notes, and vaccination history."
                    toast={toast}
                />
            </div>
        </AdminLayout>
    );
}
