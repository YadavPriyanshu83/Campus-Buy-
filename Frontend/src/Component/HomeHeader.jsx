import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Chatpage from "../page/Chatpage";
import chat from "../assets/chatLogo.png";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut, FiMenu } from "react-icons/fi"; // Added FiMenu

const HomeHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const chatDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.user);

  const [profileImage, setProfileImage] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
  );

  const navItems = [
    { name: "Home", path: "/home" },
    { name: "Sell Now", path: "/sell" },
    { name: "History", path: "/history" },
    { name: "Feedback", path: "/feedback" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (
        chatDropdownRef.current &&
        !chatDropdownRef.current.contains(e.target)
      ) {
        setShowChat(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user && user.profileImage) {
      setProfileImage(user.profileImage);
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.profileImage) {
            setProfileImage(parsedUser.profileImage);
          }
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      }
    }
  }, [user]);

  return (
    <motion.header
      className="flex items-center justify-between px-4 py-2 shadow-md bg-white z-50 relative"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-2 sm:gap-4">
        <motion.a
          href="/home"
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.img
            src="https://res.cloudinary.com/dzkprawxw/image/upload/v1754247101/final_logo_z1ncld.png"
            alt="Logo"
            className="w-14 h-14 rounded-full object-cover"
            whileHover={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6 }}
          />
        </motion.a>
      </div>

      {/* Center: Nav Items (hidden on mobile) */}
      <nav className="hidden md:flex flex-1 justify-center items-center">
        <div className="flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `transition duration-200 px-4 py-2 rounded-full ${
                    isActive
                      ? "text-shadow-black bg-indigo-100 hover:bg-indigo-500 hover:text-white"
                      : "text-shadow-black bg-indigo-100 hover:bg-indigo-500 hover:text-white"
                  }`
                }
              >
                {item.name}
              </NavLink>
            </motion.div>
          ))}
        </div>
      </nav>

      {/* Right: Chat & Profile */}
      <div className="flex items-center gap-5">
        {/* Chat */}
        <div className="relative" ref={chatDropdownRef}>
          <div
            className="w-10 cursor-pointer"
            onClick={() => setShowChat(!showChat)}
          >
            <motion.img
              src={chat}
              alt="Chat"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-8"
            />
          </div>
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="fixed right-4 sm:right-16 top-16 w-[90vw] sm:w-[70vw] md:w-[400px] h-[80vh] bg-white border border-gray-300 rounded-xl shadow-lg z-50 flex flex-col overflow-hidden"
              >
                <div className="p-2 border-b border-gray-200">
                  <h3 className="font-medium text-indigo-700">Messages</h3>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar p-2">
                  <Chatpage />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <motion.div
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-500 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
              }}
            />
          </motion.div>
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10"
              >
                <button
                  onClick={() => navigate("/profile")}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50"
                >
                  ⚙️ Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50"
                >
                  <div className="flex items-center gap-2 text-black cursor-pointer hover:text-red-800">
                    <FiLogOut className="text-xl text-red-600" />
                    <span className="text-base font-medium">Logout</span>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hamburger menu for mobile */}
        <button
          className="md:hidden text-2xl text-indigo-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <FiMenu />
        </button>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed top-0 right-0 w-3/4 max-w-xs h-full bg-white shadow-lg z-50 p-6 flex flex-col gap-6"
          >
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className="bg-indigo-100 px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-500 hover:text-white transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
            <button
              className="bg-indigo-100 px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-500 hover:text-white transition"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
            >
              <div className="flex items-center gap-2 text-black cursor-pointer hover:text-red-800">
                <FiLogOut className="text-xl text-red-600" />
                <span className="text-base font-medium">Logout</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default HomeHeader;
