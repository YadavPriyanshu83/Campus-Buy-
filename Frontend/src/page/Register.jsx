import React, { useEffect, useState } from "react";
import { Mail, Lock, User, Phone, Hash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  SetShowPassword,
  updateRegisterForm,
  setOtpData,
} from "../utils/userSlice";
import { hideSignupButton } from "../utils/headerSlice";
import { setCurrentPage } from "../utils/appSlice";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Component/Header.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Register() {
  const { showpassword, registerForm } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(hideSignupButton());
    dispatch(setCurrentPage("register"));
  }, [dispatch]);

  const toggleShowPassword = () => {
    dispatch(SetShowPassword());
  };

  const handleChange = (e) => {
    dispatch(updateRegisterForm({ [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("❌ Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registerForm.email,
          name: registerForm.name,
          password: registerForm.password,
          branch: registerForm.branch,
          whatsapp: registerForm.whatsapp,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        dispatch(
          setOtpData({
            email: registerForm.email,
            password: registerForm.password,
            branch: registerForm.branch,
            whatsapp: registerForm.whatsapp,
          })
        );
        toast.success("✅ OTP sent successfully!");
        setTimeout(() => navigate("/otp"), 1000);
      } else {
        toast.error(data.message || "❌ Failed to send OTP");
      }
    } catch {
      toast.error("❌ Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <ToastContainer position="top-center" />

      <section className="bg-gradient-to-b from-[#fcfdfd] via-[#fffbee] to-[#f7f9ff] h-full">
        <div className="min-h-screen flex items-center justify-center py-10 px-4">
          <div className="w-full max-w-xl shadow-xl rounded-lg p-10 ">
            <form
              className="flex flex-col text-sm bg-gradient-to-b from-[#fcfdfd] via-[#fffbee] to-[#f7f9ff] h-full"
              onSubmit={handleSubmit}
            >
              <h1 className="text-4xl font-bold py-4 text-center text-black">
                Let’s Get In Touch.
              </h1>
              <p className="text-center text-sm text-gray-600 mb-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Login here
                </Link>
              </p>

              <FormInput
                label="Full Name"
                name="name"
                value={registerForm.name}
                onChange={handleChange}
                Icon={User}
                placeholder="Enter your full name"
                type="text"
                required
              />

              <FormInput
                label="Email Address"
                name="email"
                value={registerForm.email}
                onChange={handleChange}
                Icon={Mail}
                placeholder="Enter your MMMUT email address"
                type="email"
                required
              />

              <FormInput
                label="Password"
                name="password"
                value={registerForm.password}
                onChange={handleChange}
                Icon={Lock}
                placeholder="Enter your password"
                type={showpassword ? "text" : "password"}
                required
                showToggle
                onToggle={toggleShowPassword}
                showPass={showpassword}
              />

              <FormInput
                label="Confirm Password"
                name="confirmPassword"
                value={registerForm.confirmPassword}
                onChange={handleChange}
                Icon={Lock}
                placeholder="Confirm password"
                type={showpassword ? "text" : "password"}
                required
                showToggle
                onToggle={toggleShowPassword}
                showPass={showpassword}
              />

              <FormInput
                label="Branch"
                name="branch"
                value={registerForm.branch}
                onChange={handleChange}
                Icon={Hash}
                placeholder="Enter your Branch"
                type="text"
                required
              />

              <FormInput
                label="WhatsApp No"
                name="whatsapp"
                value={registerForm.whatsapp}
                onChange={handleChange}
                Icon={Phone}
                placeholder="Enter your Number"
                type="tel"
                required
                pattern="[0-9]{10}"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  isSubmitting
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } flex items-center justify-center gap-2 mt-6 text-white py-3 w-full rounded-xl font-semibold transition duration-300 shadow-lg cursor-pointer`}
              >
                {isSubmitting ? "Submitting..." : "Submit Form"}
                {!isSubmitting && (
                  <svg className="w-5 h-5" viewBox="0 0 21 20" fill="none">
                    <path
                      d="m18.038 10.663-5.625 5.625a.94.94 0 0 1-1.328-1.328l4.024-4.023H3.625a.938.938 0 0 1 0-1.875h11.484l-4.022-4.025a.94.94 0 0 1 1.328-1.328l5.625 5.625a.935.935 0 0 1-.002 1.33"
                      fill="#fff"
                    />
                  </svg>
                )}
              </button>

              <p className="text-center text-gray-500 text-sm mt-4">
                Or contact us directly at{" "}
                <a
                  href="mailto:yadavpriyanshuyadav8354@gmail.com"
                  className="text-indigo-600 hover:underline"
                >
                  yadavpriyanshuyadav8354@gmail.com
                </a>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  Icon,
  placeholder,
  type,
  required,
  pattern,
  showToggle,
  onToggle,
  showPass,
}) {
  return (
    <div className="mt-4 relative">
      <label className="font-medium text-sm block mb-1">
        {label}
        <span className="text-red-500"> *</span>
      </label>
      <div className="flex items-center h-12 px-4 rounded-xl border border-slate-300 bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-400 transition-all relative">
        <Icon className="w-5 h-5 text-slate-500" />
        <input
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
          required={required}
          pattern={pattern}
          className="h-full px-3 w-full outline-none bg-transparent text-slate-800 placeholder-slate-400"
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 text-xl text-gray-500 hover:text-pink-600 focus:outline-none"
          >
            {showPass ? "🙈" : "👁️"}
          </button>
        )}
      </div>
    </div>
  );
}

export default Register;
