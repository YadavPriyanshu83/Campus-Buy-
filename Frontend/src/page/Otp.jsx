import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateOtp, resetOtpData, resetRegisterForm } from '../utils/userSlice';
import { setCurrentPage } from '../utils/appSlice';
import { useNavigate } from 'react-router-dom';
import Header from '../Component/Header';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Otp() {
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { otpData } = useSelector(store => store.user);

    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        dispatch(setCurrentPage('otp'));
    }, [dispatch]);

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/^[0-9]?$/.test(value)) {
            const newOtp = [...otpData.otp];
            newOtp[index] = value;
            dispatch(updateOtp(newOtp));

            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otpData.otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData("text").slice(0, 6);
        if (/^\d{6}$/.test(pasted)) {
            const otpArray = pasted.split("");
            dispatch(updateOtp(otpArray));
            otpArray.forEach((char, i) => {
                if (inputRefs.current[i]) {
                    inputRefs.current[i].value = char;
                }
            });
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async () => {
        const fullOtp = otpData.otp.join("").trim();
        const { email, password } = otpData;

        if (fullOtp.length !== 6) {
            toast.error("⚠️ Please enter the complete 6-digit OTP.");
            return;
        }

        setIsVerifying(true);

        try {
            const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp: fullOtp, password }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("🎉 Registration successful! Please log in.");
                dispatch(resetOtpData());
                dispatch(resetRegisterForm());
                navigate("/login");
            } else {
                toast.error(data.message || "❌ OTP verification failed. Please try again.");
            }
        } catch (err) {
            console.error("OTP verification error:", err);
            toast.error("❌ Server error. Please try again later.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <>
            <Header />
            <ToastContainer position="top-center" />
            <section className="bg-gradient-to-b from-[#fcfdfd] via-[#fffbee] to-[#f7f9ff] h-full">
                <div className="flex justify-center items-center p-7 bg-gray-100 px-4">
                    <div className="flex flex-col items-center md:max-w-[423px] h-[380px] bg-white rounded-2xl shadow-2xl sm:p-10">
                        <p className="mt-5 text-2xl font-semibold text-gray-900">Authenticate Your Email</p>
                        <p className="mt-5 text-sm text-gray-900/90 text-center">
                            Enter the 6-digit authentication code
                        </p>
                        <p className="text-sm text-gray-500/60 text-center">
                            The authentication code has been sent to your email:
                        </p>

                        <div className="grid grid-cols-6 gap-2 sm:gap-3 w-11/12 mt-6">
                            {otpData.otp.map((value, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    autoFocus={index === 0}
                                    value={value}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onPaste={handlePaste}
                                    disabled={isVerifying}
                                    className="w-full mt-2 h-12 bg-indigo-50 text-gray-900 text-xl rounded-md outline-none text-center focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleVerify}
                            disabled={isVerifying}
                            className={`cursor-pointer mt-11 w-full max-w-80 h-11 rounded-full text-white text-sm bg-indigo-500 transition-opacity ${
                                isVerifying ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
                            }`}
                        >
                            {isVerifying ? "Verifying..." : "Verify Email"}
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Otp;
