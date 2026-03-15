import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentPage } from '../utils/appSlice';
import { addNotification } from '../utils/appSlice';
import HomeHeader from '../Component/HomeHeader';
import { motion, AnimatePresence } from 'framer-motion';

function Feedback() {
    const [showPopup, setShowPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage('feedback'));
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = e.target;
        const name = form.querySelector('#name').value;
        const email = form.querySelector('#email').value;
        const rating = form.querySelector('select').value;
        const like = form.querySelector('#like').value;
        const improve = form.querySelector('#improve').value;

        if (!rating || !improve.trim()) {
            alert("Please fill all required fields.");
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/feedback/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, rating, like, improve })
            });

            const data = await res.json();
            if (res.ok) {
                setShowPopup(true);
                form.reset();
                dispatch(addNotification({
                    id: Date.now(),
                    type: 'success',
                    message: 'Feedback submitted successfully!'
                }));
                setTimeout(() => setShowPopup(false), 3000);
            } else {
                dispatch(addNotification({
                    id: Date.now(),
                    type: 'error',
                    message: data.message || "Failed to send feedback."
                }));
                alert(data.message || "Failed to send feedback.");
            }
        } catch (err) {
            console.error(err);
            alert("Server error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-gradient-to-b from-[#fcfdfd] via-[#fffbee] to-[#f7f9ff] min-h-screen">
            <HomeHeader />

            <motion.div
                className="min-h-screen px-3 sm:px-4 py-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="relative">
                    {/* Main Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        className="bg-white max-w-xl mx-auto my-8 p-6 rounded-lg shadow-lg border border-gray-200 space-y-4"
                        initial={{ scale: 0.985, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 120, damping: 14 }}
                    >
                        <motion.h2
                            className="text-2xl font-bold text-gray-800"
                            initial={{ x: -16, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.08 }}
                        >
                            We'd Love Your Feedback!
                        </motion.h2>
                        <motion.p
                            className="text-sm text-gray-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.12 }}
                        >
                            Help us improve your experience by filling out this quick form.
                        </motion.p>

                        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.12 }}>
                            <label htmlFor="name" className="font-medium text-gray-700">Your Name (optional)</label>
                            <input id="name" type="text" placeholder="Enter your Name"
                                className="w-full mt-1.5 border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.12 }}>
                            <label htmlFor="email" className="font-medium text-gray-700">Email (optional)</label>
                            <input id="email" type="email" placeholder="you@example.com"
                                className="w-full mt-1.5 border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                        </motion.div>

                        {/* KEEPING ORIGINAL SELECT RATING LOGIC (unchanged) */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }}>
                            <label className="font-medium text-gray-700">How would you rate your overall experience?<span className='text-red-600'> *</span></label>
                            <select required className="w-full mt-1.5 border border-gray-300 rounded px-3 py-2">
                                <option value="">Choose a rating</option>
                                <option value="5">🤩🤩🤩🤩🤩 - Excellent</option>
                                <option value="4">😊😊😊😊 - Good</option>
                                <option value="3">😐😐😐 - Average</option>
                                <option value="2">😞😞 - Poor</option>
                                <option value="1">😡- Very Poor</option>
                            </select>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.12 }}>
                            <label htmlFor="like" className="font-medium text-gray-700">What did you like about our app?</label>
                            <textarea id="like" rows={3} placeholder="e.g. Simple UI, easy listing process..."
                                className="w-full resize-none mt-1.5 border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.12 }}>
                            <label htmlFor="improve" className="font-medium text-gray-700">What can we improve?<span className='text-red-600'> *</span></label>
                            <textarea required id="improve" rows={3} placeholder="e.g. Add payment gateway, any changes in UI..."
                                className="w-full resize-none mt-1.5 border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                        </motion.div>

                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={!isSubmitting ? { scale: 1.03, boxShadow: "0px 0px 8px rgba(79,70,229,0.25)" } : {}}
                            whileTap={{ scale: 0.98 }}
                            className={`cursor-pointer w-full font-medium py-2.5 rounded transition ${
                                isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </motion.button>
                    </motion.form>

                    {/* Popup */}
                    <AnimatePresence>
                        {showPopup && (
                            <motion.div
                                className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.div
                                    className="bg-white p-6 rounded-lg shadow-xl text-center border border-green-300 max-w-xs"
                                    initial={{ y: -12, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -12, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 140 }}
                                >
                                    <motion.div
                                        className="text-green-500 text-4xl mb-2"
                                        initial={{ rotate: -15 }}
                                        animate={{ rotate: 0 }}
                                    >
                                        ✅
                                    </motion.div>
                                    <h3 className="text-lg font-semibold text-gray-800">Thank you!</h3>
                                    <p className="text-sm text-gray-600 mt-1">Your feedback has been submitted successfully.</p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </section>
    );
}

export default Feedback;
