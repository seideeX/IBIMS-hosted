import React, { useContext, useState, useEffect } from "react";
import { StepperContext } from "@/context/StepperContext";
import DropdownInputField from "../DropdownInputField";
import RadioGroup from "../RadioGroup";
import YearDropdown from "../YearDropdown";
import InputField from "../InputField";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { IoIosAddCircleOutline, IoIosCloseCircleOutline } from "react-icons/io";
import { toast } from "react-hot-toast";
import SelectField from "../SelectField";
import InputError from "../InputError";
import { toTitleCase } from "@/utils/stringFormat";

function EducationandOccupation({ occupationTypes }) {
    const { userData, setUserData, errors } = useContext(StepperContext);
    const families = userData.household?.families || [];

    const [openFamilyIndex, setOpenFamilyIndex] = useState(null);
    const [openMemberIndex, setOpenMemberIndex] = useState({});

    /** 🔹 Utility function to update nested household structure */
    const updateHousehold = (updatedFamilies) => {
        setUserData((prev) => ({
            ...prev,
            household: { ...prev.household, families: updatedFamilies },
        }));
    };

    /** 🔹 Handle Education Change */
    const handleEducationChange = (
        familyIndex,
        memberIndex,
        educationIndex,
        e,
    ) => {
        const { name, value } = e.target;
        const updatedFamilies = [...families];
        const member = updatedFamilies[familyIndex].members[memberIndex];
        const educations = [...(member.educations || [])];

        const formattedValue =
            name === "school_name" ? toTitleCase(value) : value;

        educations[educationIndex] = {
            ...educations[educationIndex],
            [name]: formattedValue,
        };

        member.educations = educations;
        updateHousehold(updatedFamilies);
    };

    /** 🔹 Add / Remove Education */
    const addEducation = (familyIndex, memberIndex) => {
        const updatedFamilies = [...families];
        const member = updatedFamilies[familyIndex].members[memberIndex];
        const educations = [...(member.educations || [])];
        educations.push({});
        member.educations = educations;
        updateHousehold(updatedFamilies);
    };

    const removeEducation = (familyIndex, memberIndex, educationIndex) => {
        const updatedFamilies = [...families];
        const member = updatedFamilies[familyIndex].members[memberIndex];
        const educations = [...(member.educations || [])];
        educations.splice(educationIndex, 1);
        member.educations = educations;
        updateHousehold(updatedFamilies);
        toast.success("Education removed.");
    };

    const handleOccupationChange = (
        familyIndex,
        memberIndex,
        occupationIndex,
        e,
    ) => {
        const { name, value } = e.target;
        const updatedFamilies = [...families];
        const member = updatedFamilies[familyIndex].members[memberIndex];
        const occupations = [...(member.occupations || [])];

        const formattedValue = ["employer", "occupation"].includes(name)
            ? toTitleCase(value)
            : value;

        const occupation = {
            ...occupations[occupationIndex],
            [name]: formattedValue,
        };
        const conversionFactors = {
            daily: 30,
            weekly: 4.33,
            "bi-weekly": 2.17,
            monthly: 1,
            annually: 1 / 12,
        };

        const income =
            name === "income"
                ? parseFloat(value)
                : parseFloat(occupation.income);
        const frequency = name === "frequency" ? value : occupation.frequency;

        if (!isNaN(income) && conversionFactors[frequency]) {
            occupation.monthly_income = (
                income * conversionFactors[frequency]
            ).toFixed(2);
        } else {
            occupation.monthly_income = "";
        }

        occupations[occupationIndex] = occupation;
        member.occupations = occupations;

        updateHousehold(updatedFamilies);
    };

    useEffect(() => {
        const brackets = [
            {
                min: 0,
                max: 12029,
                key: "poor",
                category: "low_income",
            },
            {
                min: 12030,
                max: 24060,
                key: "low_income_non_poor",
                category: "low_income",
            },
            {
                min: 24061,
                max: 48120,
                key: "lower_middle_income",
                category: "middle_income",
            },
            {
                min: 48121,
                max: 84210,
                key: "middle_middle_income",
                category: "middle_income",
            },
            {
                min: 84211,
                max: 144360,
                key: "upper_middle_income",
                category: "middle_income",
            },
            {
                min: 144361,
                max: 240600,
                key: "upper_income",
                category: "high_income",
            },
            {
                min: 240601,
                max: Infinity,
                key: "rich",
                category: "high_income",
            },
        ];

        setUserData((prev) => {
            const families = prev.household?.families || [];

            const updatedFamilies = families.map((family) => {
                const familyMonthlyIncome = (family.members || []).reduce(
                    (memberSum, member) => {
                        const memberIncome = (member.occupations || []).reduce(
                            (occSum, occ) =>
                                occSum + (parseFloat(occ.monthly_income) || 0),
                            0,
                        );

                        return memberSum + memberIncome;
                    },
                    0,
                );

                const bracketData =
                    brackets.find(
                        (b) =>
                            familyMonthlyIncome >= b.min &&
                            familyMonthlyIncome <= b.max,
                    ) || {};

                return {
                    ...family,
                    family_monthly_income: familyMonthlyIncome,
                    income_bracket: bracketData.key || "",
                    income_category: bracketData.category || "",
                };
            });

            return {
                ...prev,
                household: {
                    ...prev.household,
                    families: updatedFamilies,
                },
            };
        });
    }, [userData.household?.families]);

    const addOccupation = (familyIndex, memberIndex) => {
        const updatedFamilies = [...families];
        const member = updatedFamilies[familyIndex].members[memberIndex];
        const occupations = [...(member.occupations || [])];
        occupations.push({});
        member.occupations = occupations;
        updateHousehold(updatedFamilies);
    };

    const removeOccupation = (familyIndex, memberIndex, occupationIndex) => {
        const updatedFamilies = [...families];
        const member = updatedFamilies[familyIndex].members[memberIndex];
        const occupations = [...(member.occupations || [])];
        occupations.splice(occupationIndex, 1);
        member.occupations = occupations;
        updateHousehold(updatedFamilies);
        toast.success("Occupation removed.");
    };

    const occupations_types = occupationTypes.map((item) => item.toLowerCase());

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-1 mt-1">
                Education and Occupation
            </h2>
            <p className="text-sm text-gray-600 mb-3">
                Please provide education history, occupation and livelihood for
                each household member.
            </p>

            {families.map((family, fIndex) => (
                <div
                    key={fIndex}
                    className="mb-4 border rounded shadow-sm bg-white"
                >
                    {/* Family Accordion */}
                    <button
                        type="button"
                        className={`w-full text-left p-4 font-semibold flex justify-between items-center
                        ${
                            openFamilyIndex === fIndex
                                ? "border-t-2 border-blue-600 text-gray-900"
                                : "text-gray-700 hover:bg-sky-100"
                        }
                        transition duration-300 ease-in-out`}
                        onClick={() =>
                            setOpenFamilyIndex(
                                openFamilyIndex === fIndex ? null : fIndex,
                            )
                        }
                    >
                        <span>
                            {family.family_name
                                ? `${family.family_name} Family`
                                : `Family ${fIndex + 1}`}
                        </span>

                        {openFamilyIndex === fIndex ? (
                            <IoIosArrowUp className="text-xl text-blue-600" />
                        ) : (
                            <IoIosArrowDown className="text-xl text-blue-600" />
                        )}
                    </button>

                    {openFamilyIndex === fIndex && (
                        <div className="my-4 space-y-4 mx-4">
                            {family.members?.map((member, mIndex) => {
                                const isOpen =
                                    openMemberIndex[fIndex] === mIndex;
                                const displayName = `${member.firstname || ""} ${member.lastname || ""}`;
                                return (
                                    <div
                                        key={mIndex}
                                        className="mt-3 border rounded bg-white"
                                    >
                                        <button
                                            type="button"
                                            className={`w-full text-left p-4 font-semibold flex justify-between items-center
                                            ${
                                                isOpen
                                                    ? "border-t-2 border-blue-600 text-gray-900"
                                                    : "text-gray-700 hover:bg-sky-100"
                                            }
                                            transition duration-300 ease-in-out`}
                                            onClick={() =>
                                                setOpenMemberIndex((prev) => ({
                                                    ...prev,
                                                    [fIndex]:
                                                        prev[fIndex] === mIndex
                                                            ? null
                                                            : mIndex,
                                                }))
                                            }
                                        >
                                            <span>
                                                {displayName ||
                                                    `Member ${mIndex + 1}`}
                                            </span>
                                            {isOpen ? (
                                                <IoIosArrowUp className="text-xl text-blue-600" />
                                            ) : (
                                                <IoIosArrowDown className="text-xl text-blue-600" />
                                            )}
                                        </button>

                                        {isOpen && (
                                            <div
                                                id={`member-panel-${mIndex}`}
                                                role="region"
                                                aria-labelledby={`member-header-${mIndex}`}
                                                className="p-4 space-y-4"
                                            >
                                                <h4 className="font-bold">
                                                    Education
                                                </h4>

                                                {/* Education */}
                                                {(member.educations || []).map(
                                                    (education, eduIndex) => {
                                                        const showProgram =
                                                            education.education ===
                                                                "college" &&
                                                            education.educational_status ===
                                                                "graduated";
                                                        const secondRowCols =
                                                            showProgram
                                                                ? "md:grid-cols-4"
                                                                : "md:grid-cols-3";

                                                        return (
                                                            <div
                                                                key={eduIndex}
                                                                className="border p-4 mb-4 rounded-md relative bg-gray-50"
                                                            >
                                                                {/* Row 1 – Always 3 Inputs */}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    {/* Education Level */}
                                                                    <div>
                                                                        <DropdownInputField
                                                                            label="Educational Attainment"
                                                                            name="education"
                                                                            value={
                                                                                education.education ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handleEducationChange(
                                                                                    fIndex,
                                                                                    mIndex,
                                                                                    eduIndex,
                                                                                    e,
                                                                                )
                                                                            }
                                                                            placeholder="Select attainment"
                                                                            required
                                                                            items={[
                                                                                {
                                                                                    label: "No Education Yet",
                                                                                    value: "no_education_yet",
                                                                                },
                                                                                {
                                                                                    label: "No Formal Education",
                                                                                    value: "no_formal_education",
                                                                                },
                                                                                {
                                                                                    label: "Prep School",
                                                                                    value: "prep_school",
                                                                                },
                                                                                {
                                                                                    label: "Kindergarten",
                                                                                    value: "kindergarten",
                                                                                },
                                                                                {
                                                                                    label: "Elementary",
                                                                                    value: "elementary",
                                                                                },
                                                                                {
                                                                                    label: "High School",
                                                                                    value: "high_school",
                                                                                },
                                                                                {
                                                                                    label: "Senior High School",
                                                                                    value: "senior_high_school",
                                                                                },
                                                                                {
                                                                                    label: "College",
                                                                                    value: "college",
                                                                                },
                                                                                {
                                                                                    label: "ALS (Alternative Learning System)",
                                                                                    value: "als",
                                                                                },
                                                                                {
                                                                                    label: "TESDA",
                                                                                    value: "tesda",
                                                                                },
                                                                                {
                                                                                    label: "Vocational",
                                                                                    value: "vocational",
                                                                                },
                                                                                {
                                                                                    label: "Post Graduate",
                                                                                    value: "post_graduate",
                                                                                },
                                                                            ]}
                                                                        />
                                                                        {errors?.[
                                                                            `families.${fIndex}.members.${mIndex}.educations.${eduIndex}.education`
                                                                        ] && (
                                                                            <p className="text-red-500 text-xs">
                                                                                {
                                                                                    errors[
                                                                                        `families.${fIndex}.members.${mIndex}.educations.${eduIndex}.education`
                                                                                    ]
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    {/* Educational Status */}
                                                                    <div>
                                                                        <DropdownInputField
                                                                            label="Educational Status"
                                                                            name="educational_status"
                                                                            value={
                                                                                education.educational_status ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handleEducationChange(
                                                                                    fIndex,
                                                                                    mIndex,
                                                                                    eduIndex,
                                                                                    e,
                                                                                )
                                                                            }
                                                                            placeholder="Select status"
                                                                            items={[
                                                                                {
                                                                                    label: "Currently Enrolled",
                                                                                    value: "enrolled",
                                                                                },
                                                                                {
                                                                                    label: "Graduated",
                                                                                    value: "graduated",
                                                                                },
                                                                                {
                                                                                    label: "Incomplete",
                                                                                    value: "incomplete",
                                                                                },
                                                                                {
                                                                                    label: "Dropped Out",
                                                                                    value: "dropped_out",
                                                                                },
                                                                            ]}
                                                                            disabled={
                                                                                education.education ===
                                                                                    "no_formal_education" ||
                                                                                education.education ===
                                                                                    "no_education_yet"
                                                                            }
                                                                        />
                                                                        {errors?.[
                                                                            `families.${fIndex}.members.${mIndex}.educations.${eduIndex}.educational_status`
                                                                        ] && (
                                                                            <p className="text-red-500 text-xs">
                                                                                {
                                                                                    errors[
                                                                                        `families.${fIndex}.members.${mIndex}.educations.${eduIndex}.educational_status`
                                                                                    ]
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    {/* School Name */}
                                                                    <div>
                                                                        <InputField
                                                                            label="School Name"
                                                                            name="school_name"
                                                                            type="text"
                                                                            value={
                                                                                education.school_name ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handleEducationChange(
                                                                                    fIndex,
                                                                                    mIndex,
                                                                                    eduIndex,
                                                                                    e,
                                                                                )
                                                                            }
                                                                            placeholder="Enter school name"
                                                                            disabled={
                                                                                education.education ===
                                                                                    "no_formal_education" ||
                                                                                education.education ===
                                                                                    "no_education_yet"
                                                                            }
                                                                        />
                                                                        {errors?.[
                                                                            `families.${fIndex}.members.${mIndex}.educations.${eduIndex}.school_name`
                                                                        ] && (
                                                                            <p className="text-red-500 text-xs">
                                                                                {
                                                                                    errors[
                                                                                        `families.${fIndex}.members.${mIndex}.educations.${eduIndex}.school_name`
                                                                                    ]
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Row 2 – 3 or 4 Inputs depending on showProgram */}
                                                                <div
                                                                    className={`grid grid-cols-1 ${secondRowCols} gap-4 mt-4`}
                                                                >
                                                                    {/* School Type */}
                                                                    <div>
                                                                        <RadioGroup
                                                                            label="School Type"
                                                                            name="school_type"
                                                                            options={[
                                                                                {
                                                                                    label: "Public",
                                                                                    value: "public",
                                                                                },
                                                                                {
                                                                                    label: "Private",
                                                                                    value: "private",
                                                                                },
                                                                            ]}
                                                                            selectedValue={
                                                                                education.school_type ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handleEducationChange(
                                                                                    fIndex,
                                                                                    mIndex,
                                                                                    eduIndex,
                                                                                    e,
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                education.education ===
                                                                                    "no_formal_education" ||
                                                                                education.education ===
                                                                                    "no_education_yet"
                                                                            }
                                                                        />
                                                                        {errors?.[
                                                                            `families.${fIndex}.members.${mIndex}.educations.${eduIndex}.school_type`
                                                                        ] && (
                                                                            <p className="text-red-500 text-xs">
                                                                                {
                                                                                    errors[
                                                                                        `families.${fIndex}.members.${mIndex}.educations.${eduIndex}.school_type`
                                                                                    ]
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    {/* Year Started */}
                                                                    <div>
                                                                        <YearDropdown
                                                                            label="Year Started"
                                                                            name="year_started"
                                                                            value={
                                                                                education.year_started ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handleEducationChange(
                                                                                    fIndex,
                                                                                    mIndex,
                                                                                    eduIndex,
                                                                                    e,
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                education.education ===
                                                                                    "no_formal_education" ||
                                                                                education.education ===
                                                                                    "no_education_yet"
                                                                            }
                                                                        />
                                                                        {errors?.[
                                                                            `families.${fIndex}.members.${mIndex}.educations.${eduIndex}.year_started`
                                                                        ] && (
                                                                            <p className="text-red-500 text-xs">
                                                                                {
                                                                                    errors[
                                                                                        `families.${fIndex}.members.${mIndex}.educations.${eduIndex}.year_started`
                                                                                    ]
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    {/* Year Ended */}
                                                                    <div>
                                                                        <YearDropdown
                                                                            label="Year Ended"
                                                                            name="year_ended"
                                                                            value={
                                                                                education.year_ended ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handleEducationChange(
                                                                                    fIndex,
                                                                                    mIndex,
                                                                                    eduIndex,
                                                                                    e,
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                education.education ===
                                                                                    "no_formal_education" ||
                                                                                education.education ===
                                                                                    "no_education_yet" ||
                                                                                education.educational_status ==
                                                                                    "enrolled"
                                                                            }
                                                                        />
                                                                        {errors?.[
                                                                            `families.${fIndex}.members.${mIndex}.educations.${eduIndex}.year_ended`
                                                                        ] && (
                                                                            <p className="text-red-500 text-xs">
                                                                                {
                                                                                    errors[
                                                                                        `families.${fIndex}.members.${mIndex}.educations.${eduIndex}.year_ended`
                                                                                    ]
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    {/* Program (only for College) */}
                                                                    {education.education ===
                                                                        "college" && (
                                                                        <div>
                                                                            <InputField
                                                                                label={
                                                                                    education.educational_status ===
                                                                                    "graduated"
                                                                                        ? "Finished Course"
                                                                                        : "Current Course"
                                                                                }
                                                                                name="program"
                                                                                type="text"
                                                                                value={
                                                                                    education.program ||
                                                                                    ""
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    handleEducationChange(
                                                                                        fIndex,
                                                                                        mIndex,
                                                                                        eduIndex,
                                                                                        e,
                                                                                    )
                                                                                }
                                                                                placeholder="Enter your course"
                                                                                disabled={
                                                                                    education.education ===
                                                                                    "no_formal_education"
                                                                                }
                                                                            />
                                                                            {errors?.[
                                                                                `families.${fIndex}.members.${mIndex}.educations.${eduIndex}.program`
                                                                            ] && (
                                                                                <p className="text-red-500 text-xs">
                                                                                    {
                                                                                        errors[
                                                                                            `families.${fIndex}.members.${mIndex}.educations.${eduIndex}.program`
                                                                                        ]
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Remove Button */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeEducation(
                                                                            fIndex,
                                                                            mIndex,
                                                                            eduIndex,
                                                                        )
                                                                    }
                                                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                                                                >
                                                                    <IoIosCloseCircleOutline className="text-2xl" />
                                                                </button>
                                                            </div>
                                                        );
                                                    },
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        addEducation(
                                                            fIndex,
                                                            mIndex,
                                                        )
                                                    }
                                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mt-4 transition-colors duration-200"
                                                >
                                                    <IoIosAddCircleOutline className="text-4xl" />
                                                    <span>
                                                        Add Education History
                                                    </span>
                                                </button>

                                                {/* 🔹 Occupation Section */}
                                                <hr className="h-px bg-sky-500 border-0 transform scale-y-100 origin-center" />
                                                <p className="font-bold">
                                                    Occupation Background
                                                </p>
                                                {(member.occupations || []).map(
                                                    (occupation, occIndex) => (
                                                        <div
                                                            key={occIndex}
                                                            className="border p-4 mb-4 rounded-md relative bg-gray-50"
                                                        >
                                                            <div className="grid md:grid-cols-4 gap-4">
                                                                {/* Employment Status */}
                                                                <div>
                                                                    <SelectField
                                                                        label="Employment Status"
                                                                        name="employment_status"
                                                                        value={
                                                                            occupation.employment_status ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleOccupationChange(
                                                                                fIndex,
                                                                                mIndex,
                                                                                occIndex,
                                                                                e,
                                                                            )
                                                                        }
                                                                        required
                                                                        placeholder="Select employment status"
                                                                        items={[
                                                                            {
                                                                                label: "Employed",
                                                                                value: "employed",
                                                                            },
                                                                            {
                                                                                label: "Unemployed",
                                                                                value: "unemployed",
                                                                            },
                                                                            {
                                                                                label: "Retired",
                                                                                value: "retired",
                                                                            },
                                                                            {
                                                                                label: "Student",
                                                                                value: "student",
                                                                            },
                                                                            {
                                                                                label: "Child",
                                                                                value: "child",
                                                                            },
                                                                            {
                                                                                label: "Homemaker",
                                                                                value: "homemaker",
                                                                            },
                                                                            {
                                                                                label: "Not Applicable",
                                                                                value: "not_applicable",
                                                                            },
                                                                        ]}
                                                                    />
                                                                    {errors?.[
                                                                        `families.${fIndex}.members.${mIndex}.occupations.${occIndex}.employment_status`
                                                                    ] && (
                                                                        <p className="text-red-500 text-xs">
                                                                            {
                                                                                errors[
                                                                                    `families.${fIndex}.members.${mIndex}.occupations.${occIndex}.employment_status`
                                                                                ]
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {/* Occupation */}
                                                                <div>
                                                                    <DropdownInputField
                                                                        label="Occupation"
                                                                        name="occupation"
                                                                        value={
                                                                            occupation.occupation ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleOccupationChange(
                                                                                fIndex,
                                                                                mIndex,
                                                                                occIndex,
                                                                                e,
                                                                            )
                                                                        }
                                                                        placeholder="Select or Enter Occupation"
                                                                        items={
                                                                            occupations_types
                                                                        }
                                                                        disabled={
                                                                            occupation.employment_status ===
                                                                                "unemployed" ||
                                                                            occupation.employment_status ===
                                                                                "not_applicable"
                                                                        }
                                                                    />
                                                                </div>

                                                                {/* Employment Type */}
                                                                <div>
                                                                    <SelectField
                                                                        label="Employment Type"
                                                                        name="employment_type"
                                                                        value={
                                                                            occupation.employment_type ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleOccupationChange(
                                                                                fIndex,
                                                                                mIndex,
                                                                                occIndex,
                                                                                e,
                                                                            )
                                                                        }
                                                                        placeholder="Select employment type"
                                                                        items={[
                                                                            {
                                                                                label: "Full Time",
                                                                                value: "full_time",
                                                                            },
                                                                            {
                                                                                label: "Part Time",
                                                                                value: "part_time",
                                                                            },
                                                                            {
                                                                                label: "Seasonal",
                                                                                value: "seasonal",
                                                                            },
                                                                            {
                                                                                label: "Contractual",
                                                                                value: "contractual",
                                                                            },
                                                                            {
                                                                                label: "Self-Employed",
                                                                                value: "self_employed",
                                                                            },
                                                                            {
                                                                                label: "Underemployed",
                                                                                value: "under_employed",
                                                                            },
                                                                        ]}
                                                                        disabled={
                                                                            occupation.employment_status ===
                                                                                "unemployed" ||
                                                                            occupation.employment_status ===
                                                                                "not_applicable"
                                                                        }
                                                                    />
                                                                </div>

                                                                {/* Occupation Status */}
                                                                <div>
                                                                    <SelectField
                                                                        label="Occupation Status"
                                                                        name="occupation_status"
                                                                        value={
                                                                            occupation.occupation_status ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleOccupationChange(
                                                                                fIndex,
                                                                                mIndex,
                                                                                occIndex,
                                                                                e,
                                                                            )
                                                                        }
                                                                        placeholder="Select occupation status"
                                                                        items={[
                                                                            {
                                                                                label: "Active",
                                                                                value: "active",
                                                                            },
                                                                            {
                                                                                label: "Inactive",
                                                                                value: "inactive",
                                                                            },
                                                                            {
                                                                                label: "Ended",
                                                                                value: "ended",
                                                                            },
                                                                            {
                                                                                label: "Retired",
                                                                                value: "retired",
                                                                            },
                                                                            {
                                                                                label: "Terminated",
                                                                                value: "terminated",
                                                                            },
                                                                            {
                                                                                label: "Resigned",
                                                                                value: "resigned",
                                                                            },
                                                                        ]}
                                                                        disabled={
                                                                            occupation.employment_status ===
                                                                                "unemployed" ||
                                                                            occupation.employment_status ===
                                                                                "not_applicable"
                                                                        }
                                                                    />
                                                                </div>

                                                                {/* Work Arrangement */}
                                                                <div>
                                                                    <SelectField
                                                                        label="Work Arrangement"
                                                                        name="work_arrangement"
                                                                        value={
                                                                            occupation.work_arrangement ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleOccupationChange(
                                                                                fIndex,
                                                                                mIndex,
                                                                                occIndex,
                                                                                e,
                                                                            )
                                                                        }
                                                                        items={[
                                                                            {
                                                                                label: "Remote",
                                                                                value: "remote",
                                                                            },
                                                                            {
                                                                                label: "Onsite",
                                                                                value: "on_site",
                                                                            },
                                                                            {
                                                                                label: "Hybrid",
                                                                                value: "hybrid",
                                                                            },
                                                                        ]}
                                                                        disabled={
                                                                            occupation.employment_status ===
                                                                                "unemployed" ||
                                                                            occupation.employment_status ===
                                                                                "not_applicable"
                                                                        }
                                                                    />
                                                                </div>

                                                                {/* Employer Name */}
                                                                <div>
                                                                    <InputField
                                                                        label="Employer Name"
                                                                        name="employer"
                                                                        type="text"
                                                                        value={
                                                                            occupation.employer ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleOccupationChange(
                                                                                fIndex,
                                                                                mIndex,
                                                                                occIndex,
                                                                                e,
                                                                            )
                                                                        }
                                                                        placeholder="Enter employer name"
                                                                        disabled={
                                                                            occupation.employment_status ===
                                                                                "unemployed" ||
                                                                            occupation.employment_status ===
                                                                                "not_applicable"
                                                                        }
                                                                    />
                                                                </div>

                                                                {/* Year Started */}
                                                                <div>
                                                                    <YearDropdown
                                                                        label="Year Started"
                                                                        name="started_at"
                                                                        value={
                                                                            occupation.started_at ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleOccupationChange(
                                                                                fIndex,
                                                                                mIndex,
                                                                                occIndex,
                                                                                e,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            occupation.employment_status ===
                                                                                "unemployed" ||
                                                                            occupation.employment_status ===
                                                                                "not_applicable"
                                                                        }
                                                                    />
                                                                </div>

                                                                {/* Year Ended */}
                                                                <div>
                                                                    <YearDropdown
                                                                        label="Year Ended"
                                                                        name="ended_at"
                                                                        value={
                                                                            occupation.ended_at ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleOccupationChange(
                                                                                fIndex,
                                                                                mIndex,
                                                                                occIndex,
                                                                                e,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            occupation.occupation_status ===
                                                                                "active" ||
                                                                            occupation.occupation_status ===
                                                                                "inactive" ||
                                                                            occupation.employment_status ===
                                                                                "unemployed" ||
                                                                            occupation.employment_status ===
                                                                                "not_applicable"
                                                                        }
                                                                    />
                                                                </div>

                                                                {/* Income Frequency */}
                                                                <div>
                                                                    <SelectField
                                                                        label="Income Frequency"
                                                                        name="frequency"
                                                                        value={
                                                                            occupation.frequency ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleOccupationChange(
                                                                                fIndex,
                                                                                mIndex,
                                                                                occIndex,
                                                                                e,
                                                                            )
                                                                        }
                                                                        items={[
                                                                            {
                                                                                label: "Daily",
                                                                                value: "daily",
                                                                            },
                                                                            {
                                                                                label: "Weekly",
                                                                                value: "weekly",
                                                                            },
                                                                            {
                                                                                label: "Bi-Weekly",
                                                                                value: "bi-weekly",
                                                                            },
                                                                            {
                                                                                label: "Monthly",
                                                                                value: "monthly",
                                                                            },
                                                                            {
                                                                                label: "Annually",
                                                                                value: "annually",
                                                                            },
                                                                        ]}
                                                                        placeholder="Select frequency"
                                                                        disabled={
                                                                            occupation.employment_status ===
                                                                                "unemployed" ||
                                                                            occupation.employment_status ===
                                                                                "not_applicable"
                                                                        }
                                                                    />
                                                                </div>

                                                                {/* Income */}
                                                                <div>
                                                                    <InputField
                                                                        type="number"
                                                                        label="Income"
                                                                        name="income"
                                                                        value={
                                                                            occupation.income ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleOccupationChange(
                                                                                fIndex,
                                                                                mIndex,
                                                                                occIndex,
                                                                                e,
                                                                            )
                                                                        }
                                                                        placeholder="Enter income"
                                                                        disabled={
                                                                            occupation.employment_status ===
                                                                                "unemployed" ||
                                                                            occupation.employment_status ===
                                                                                "not_applicable"
                                                                        }
                                                                    />
                                                                </div>

                                                                {/* Monthly Income (auto-computed, hidden) */}
                                                                <div className="hidden">
                                                                    <InputField
                                                                        type="number"
                                                                        label="Monthly Income"
                                                                        name="monthly_income"
                                                                        value={
                                                                            occupation.monthly_income ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleOccupationChange(
                                                                                fIndex,
                                                                                mIndex,
                                                                                occIndex,
                                                                                e,
                                                                            )
                                                                        }
                                                                        placeholder="Auto-computed"
                                                                        disabled
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <RadioGroup
                                                                        label="Main Source of Income?"
                                                                        name="is_main_source" // ✅ match the state key
                                                                        selectedValue={
                                                                            occupation.is_main_source ||
                                                                            ""
                                                                        }
                                                                        options={[
                                                                            {
                                                                                label: "Yes",
                                                                                value: 1,
                                                                            },
                                                                            {
                                                                                label: "No",
                                                                                value: 0,
                                                                            },
                                                                        ]}
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleOccupationChange(
                                                                                fIndex,
                                                                                mIndex,
                                                                                occIndex,
                                                                                e,
                                                                            )
                                                                        }
                                                                        required
                                                                        disabled={
                                                                            occupation.employment_status ===
                                                                                "unemployed" ||
                                                                            occupation.employment_status ===
                                                                                "not_applicable"
                                                                        }
                                                                    />
                                                                </div>

                                                                {/* OFW */}
                                                                <div>
                                                                    <RadioGroup
                                                                        label="Overseas Filipino Worker"
                                                                        name="is_ofw"
                                                                        selectedValue={
                                                                            occupation.is_ofw ||
                                                                            ""
                                                                        }
                                                                        options={[
                                                                            {
                                                                                label: "Yes",
                                                                                value: 1,
                                                                            },
                                                                            {
                                                                                label: "No",
                                                                                value: 0,
                                                                            },
                                                                        ]}
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleOccupationChange(
                                                                                fIndex,
                                                                                mIndex,
                                                                                occIndex,
                                                                                e,
                                                                            )
                                                                        }
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Remove button */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeOccupation(
                                                                        fIndex,
                                                                        mIndex,
                                                                        occIndex,
                                                                    )
                                                                }
                                                                className="absolute top-1 right-2 flex items-center gap-1 text-sm text-red-400 hover:text-red-800 font-medium mt-1 mb-5 transition-colors duration-200"
                                                            >
                                                                <IoIosCloseCircleOutline className="text-2xl" />
                                                            </button>
                                                        </div>
                                                    ),
                                                )}
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mt-4 transition-colors duration-200"
                                                    onClick={() =>
                                                        addOccupation(
                                                            fIndex,
                                                            mIndex,
                                                        )
                                                    }
                                                >
                                                    <IoIosAddCircleOutline className="text-4xl" />{" "}
                                                    <span>Add Occupation</span>
                                                </button>

                                                {/* HIDDEN FAMILY MONTHLY INCOME + BRACKET + CATEGORY */}
                                                <div className="hidden">
                                                    <div className="hidden">
                                                        <InputField
                                                            label="Family Monthly Income"
                                                            name="family_monthly_income"
                                                            value={
                                                                family.family_monthly_income ||
                                                                ""
                                                            }
                                                            readOnly
                                                        />

                                                        <DropdownInputField
                                                            label="Income Bracket"
                                                            name="income_bracket"
                                                            value={
                                                                family.income_bracket ||
                                                                ""
                                                            }
                                                            items={[
                                                                family.income_bracket ||
                                                                    "",
                                                            ]}
                                                            readOnly
                                                        />

                                                        <DropdownInputField
                                                            label="Income Category"
                                                            name="income_category"
                                                            value={
                                                                family.income_category ||
                                                                ""
                                                            }
                                                            items={[
                                                                family.income_category ||
                                                                    "",
                                                            ]}
                                                            readOnly
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default EducationandOccupation;
