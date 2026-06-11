import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { toast } from "sonner"; // import sonner

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
            onError: (err) => {
                console.error("Login error details:", err); // for debugging

                if (err.email) {
                    toast.error(`Email Error: ${err.email}`);
                } else if (err.password) {
                    toast.error(`Password Error: ${err.password}`);
                } else if (err.message) {
                    toast.error(`Login Failed: ${err.message}`);
                } else {
                    toast.error(
                        "Login failed. Please check your credentials and try again.",
                    );
                }
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />
            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 animate-fadeIn">
                    {status}
                </div>
            )}
            <form onSubmit={submit} className="space-y-5">
                {/* SYSTEM HEADER */}
                <div className="text-center border-b pb-4 mb-6">
                    <h1 className="text-xl font-semibold text-gray-800 tracking-wide">
                        iBIMS
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        ILAGAN CITY — Barangay Information Management System
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                        Secure Government Access Portal
                    </p>
                </div>

                {/* EMAIL */}
                <div className="space-y-1">
                    <InputLabel htmlFor="email" value="Username / Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm
                focus:border-gray-500 focus:ring-gray-400 transition-none"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData("email", e.target.value)}
                    />

                    <InputError message={errors.email} className="text-xs" />
                </div>

                {/* PASSWORD */}
                <div className="space-y-1">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm
                focus:border-gray-500 focus:ring-gray-400 transition-none"
                        autoComplete="current-password"
                        onChange={(e) => setData("password", e.target.value)}
                    />

                    <InputError message={errors.password} className="text-xs" />
                </div>

                {/* OPTIONS */}
                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-600">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData("remember", e.target.checked)
                            }
                        />
                        Remember me
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className="text-gray-600 hover:text-gray-900 underline"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                {/* BUTTON */}
                <PrimaryButton
                    className="w-full py-2 rounded border border-gray-700 bg-gray-800
            text-white font-medium hover:bg-gray-900 transition-none
            disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={processing}
                >
                    {processing ? "Authenticating..." : "Login"}
                </PrimaryButton>

                {/* FOOTER */}
                <div className="text-center pt-4 border-t mt-6">
                    <p className="text-[11px] text-gray-500">
                        © {new Date().getFullYear()} Republic of the Philippines
                        — iBIMS
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                        Unauthorized access is strictly prohibited
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
