import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentPage } from "../utils/appSlice";
import { setProfile, updateProfileImage } from "../utils/userSlice";
import { useAuth } from "../utils/authUtils";
import HomeHeader from "../Component/HomeHeader.jsx";
import axios from "axios";

const UserProfile = () => {
  const dispatch = useDispatch();
  const { token } = useAuth();
  const { user } = useSelector((store) => store.user);

  // Initialize state with user data or empty values
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    branch: "",
    whatsapp: "",
    profileImage:
      "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);
  const [isEditingWhatsapp, setIsEditingWhatsapp] = useState(false);
  const [tempWhatsapp, setTempWhatsapp] = useState("");

  useEffect(() => {
    dispatch(setCurrentPage("profile"));

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/auth/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data) {
          setUserData(response.data);
          dispatch(setProfile(response.data));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");

        if (user) {
          setUserData({
            name: user.name || "",
            email: user.email || "",
            branch: user.branch || "",
            whatsapp: user.whatsapp || "",
            profileImage:
              user.profileImage ||
              "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [dispatch, token]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setUserData((prev) => ({ ...prev, profileImage: localPreviewUrl }));

    try {
      if (loading) return;

      const formData = new FormData();
      formData.append("image", file);

      setLoading(true);
      setError("");

      const uploadResponse = await axios.post(
        "http://localhost:5000/api/auth/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (uploadResponse.data && uploadResponse.data.imageUrl) {
        const newImageUrl = uploadResponse.data.imageUrl;

        // Immediately save the new image URL to database
        const updateResponse = await axios.put(
          "http://localhost:5000/api/auth/update-profile",
          {
            whatsapp: userData.whatsapp,
            profileImage: newImageUrl,
            branch: userData.branch,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (updateResponse.data) {
          setUserData((prev) => ({ ...prev, profileImage: newImageUrl }));
          dispatch(setProfile(updateResponse.data.user));
          dispatch(updateProfileImage(newImageUrl));
          localStorage.setItem(
            "user",
            JSON.stringify(updateResponse.data.user)
          );
          setTimeout(() => {
            handleSaveChanges();
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image. Please try again.");

      if (user && user.profileImage) {
        setUserData((prev) => ({ ...prev, profileImage: user.profileImage }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      const response = await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        {
          whatsapp: userData.whatsapp,
          profileImage: userData.profileImage,
          branch: userData.branch,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        dispatch(setProfile(response.data.user));
        localStorage.setItem("user", JSON.stringify(response.data.user));
        alert("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile");
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const formatBranchName = (branch) => {
    if (!branch) return "Not specified";
    return branch
      .split(/\s+|-|_/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Function to validate WhatsApp number
  const validateWhatsappNumber = (number) => {
    const digitsOnly = number.replace(/\D/g, "");
    return digitsOnly.length === 10;
  };

  const handleWhatsappInputChange = async (e) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, "");

    setTempWhatsapp(digitsOnly);

    if (digitsOnly.length === 10) {
      setWhatsappError("");
      setIsSavingWhatsapp(true);

      try {
        const response = await axios.put(
          "http://localhost:5000/api/auth/update-profile",
          {
            whatsapp: digitsOnly,
            profileImage: userData.profileImage,
            branch: userData.branch,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          setUserData((prev) => ({ ...prev, whatsapp: digitsOnly }));
          dispatch(setProfile(response.data.user));
          localStorage.setItem("user", JSON.stringify(response.data.user));

          setTimeout(() => {
            setIsEditingWhatsapp(false);
            setIsSavingWhatsapp(false);
          }, 1500);
        }
      } catch (error) {
        console.error("Error auto-saving WhatsApp:", error);
        setWhatsappError("Failed to save WhatsApp number");
        setIsSavingWhatsapp(false);
      }
    } else if (digitsOnly.length > 10) {
      setTempWhatsapp(digitsOnly.slice(0, 10));
      setWhatsappError("Maximum 10 digits allowed");
    } else if (digitsOnly.length > 0) {
      setWhatsappError(
        `Enter ${10 - digitsOnly.length} more digit${
          10 - digitsOnly.length > 1 ? "s" : ""
        }`
      );
    } else {
      setWhatsappError("");
    }
  };

  return (
    <>
      <HomeHeader />
      <section className="bg-gradient-to-b from-[#fcfdfd] via-[#fffbee] to-[#f7f9ff] p-20 flex items-center justify-center ">
      {/* <div className="min-h-screen bg-gradient-to-r from-[#f9f9f9] to-[#e0e7ff] "> */}
        <div className="w-full max-w-5xl bg-white/30 backdrop-blur-md shadow-xl rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10 transition-all duration-300 border border-gray-200">
          <div className="relative w-full md:w-auto flex flex-col items-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 hover:scale-105 transition-transform duration-300 shadow-xl">
              <img
                src={
                  userData.profileImage ||
                  "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
                }
                alt="Profile"
                className="w-full h-full object-cover rounded-full border-4 border-white"
              />
            </div>
            <label className="mt-3 block text-center">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <span className="mt-2 sm:mt-4 inline-block cursor-pointer text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-lg transition-all duration-300">
                Change Photo
              </span>
            </label>
          </div>

          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 md:mt-0">
            <div>
              <label className="block text-gray-700 text-sm sm:text-base font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={userData.name || ""}
                readOnly
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm sm:text-base font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={userData.email || ""}
                readOnly
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm sm:text-base font-medium mb-1">
                Branch
              </label>
              <div className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 shadow-sm">
                <span className="text-gray-800 font-medium">
                  {formatBranchName(userData.branch)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm sm:text-base font-medium mb-1">
                WhatsApp Number
              </label>
              {!isEditingWhatsapp ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 shadow-sm">
                    <span className="text-gray-800">
                      {userData.whatsapp || "Not provided"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setTempWhatsapp(userData.whatsapp || "");
                      setIsEditingWhatsapp(true);
                      setWhatsappError("");
                    }}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempWhatsapp}
                      onChange={handleWhatsappInputChange}
                      maxLength="10"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      className={`flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none bg-white shadow-sm ${
                        whatsappError && !isSavingWhatsapp
                          ? "border-red-400 focus:ring-red-400"
                          : isSavingWhatsapp
                          ? "border-green-400 focus:ring-green-400"
                          : "border-indigo-400 focus:ring-indigo-400"
                      }`}
                      placeholder="Enter 10-digit WhatsApp number"
                      disabled={isSavingWhatsapp}
                    />
                    {isSavingWhatsapp ? (
                      <div className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
                        ✓ Saved
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setIsEditingWhatsapp(false);
                          setWhatsappError("");
                        }}
                        className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {isSavingWhatsapp && (
                    <p className="text-sm text-green-600">
                      ✓ WhatsApp number saved automatically
                    </p>
                  )}
                  {whatsappError && !isSavingWhatsapp && (
                    <p
                      className={`text-sm ${
                        whatsappError.includes("Enter")
                          ? "text-blue-600"
                          : "text-red-500"
                      }`}
                    >
                      {whatsappError}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="col-span-2 text-center mt-4">
              <button
                onClick={handleSaveChanges}
                disabled={loading}
                className={`px-4 sm:px-6 py-1.5 sm:py-2 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed opacity-70"
                    : "bg-green-600 hover:bg-green-700 cursor-pointer transform hover:scale-105"
                } text-white rounded-full font-medium shadow-md transition-all duration-300 min-w-[120px] sm:min-w-[150px]`}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
       </section>
    </>
  );
};

export default UserProfile;
