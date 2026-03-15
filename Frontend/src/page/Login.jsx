import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  SetShowPassword,
  updateLoginForm,
  setToken,
  setAuthenticated,
  setUser,
  resetLoginForm,
  setProfile,
} from "../utils/userSlice";
import { hideLoginButton } from "../utils/headerSlice";
import { setCurrentPage } from "../utils/appSlice";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Component/Header.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const { showpassword, loginForm } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(hideLoginButton());
    dispatch(setCurrentPage("login"));
  }, [dispatch]);

  const handleChange = (e) => {
    dispatch(updateLoginForm({ [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(setToken(data.token));
        dispatch(setAuthenticated(true));

        const userData = data.user || { email: loginForm.email };
        dispatch(setUser(userData));

        dispatch(
          setProfile({
            name: userData.name || "",
            email: userData.email || "",
            branch: userData.branch || "",
            whatsapp: userData.whatsappNumber || "",
          })
        );

        dispatch(resetLoginForm());

        toast.success("Login successful! Redirecting...", {
          position: "top-right",
          autoClose: 1500,
        });

        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        toast.error(data.message || "Invalid credentials", {
          position: "top-right",
        });
      }
    } catch (err) {
      toast.error("Server error. Please try again later.", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    dispatch(SetShowPassword());
  };

  return (
    <>
      <ToastContainer />
      <Header />
      <section className="bg-gradient-to-b from-[#fcfdfd] via-[#fffbee] to-[#f7f9ff] min-h-screen flex items-center justify-center px-4 py-8">
        <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto shadow-lg rounded-lg overflow-hidden bg-white">
          {/* Left Image Section */}
          <div className="hidden md:block md:w-1/2">
            <img
              className="h-full w-full object-cover"
              src="https://res.cloudinary.com/dzkprawxw/image/upload/v1754252837/sign-in_ahpmg5.png"
              alt="Login visual"
            />
          </div>

          {/* Right Form Section */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-10">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-sm flex flex-col"
            >
              <h2 className="text-3xl sm:text-4xl text-gray-900 font-medium text-center">
                Sign in
              </h2>
              <p className="text-sm text-gray-500/90 mt-3 text-center">
                Welcome back! Please sign in to continue
              </p>
              <p className="text-center text-sm text-gray-600 mt-2 mb-4">
                Don’t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Register now
                </Link>
              </p>

              {/* Email */}
              <div className="flex items-center w-full border border-gray-300/60 h-12 rounded-full pl-6 gap-2 mt-4">
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleChange}
                  placeholder="Email ID"
                  className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative flex items-center mt-6 w-full border border-gray-300/60 h-12 rounded-full pl-6 pr-12 gap-2">
                <input
                  type={showpassword ? "text" : "password"}
                  name="password"
                  value={loginForm.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                  required
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-4 text-xl text-gray-500 hover:text-pink-600 transition"
                >
                  {showpassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Remember Me + Forgot */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-gray-500/80 gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input className="h-4 w-4" type="checkbox" />
                  Remember me
                </label>
                <a className="text-sm underline" href="#">
                  Forgot password?
                </a>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className={`mt-6 w-full h-11 rounded-full text-white ${
                  loading
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-indigo-500 hover:opacity-90"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default Login;
