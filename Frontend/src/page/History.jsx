import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentPage } from '../utils/appSlice';
import HomeHeader from '../Component/HomeHeader';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function History() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(setCurrentPage('history'));
        fetchUserProducts();
    }, [dispatch]);

    const fetchUserProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to view your listed products');
                setLoading(false);
                return;
            }
            const response = await axios.get('http://localhost:5000/api/product/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            const errorMessage = error.response?.data?.error || 'Failed to fetch products';
            setError(errorMessage);
            setLoading(false);
        }
    };

    const confirmDelete = (productId) => {
        setDeleteConfirm(productId);
    };

    const cancelDelete = () => {
        setDeleteConfirm(null);
    };

    const handleDelete = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to delete products');
                return;
            }

            await axios.delete(`http://localhost:5000/api/product/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update UI by removing the deleted product
            setProducts(products.filter(product => product._id !== productId));
            setDeleteConfirm(null);
            toast.success('Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            const errorMessage = error.response?.data?.error || 'Failed to delete product';
            toast.error(errorMessage);
            setDeleteConfirm(null);
        }
    };

    return (
       <section className="bg-gradient-to-b from-[#fcfdfd] via-[#fffbee] to-[#f7f9ff] min-h-screen">
            <HomeHeader />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">My Listed Products</h1>
                
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-10">
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    <div className="relative">
                                        <img 
                                            src={product.images[0] || "https://placehold.co/400x300?text=No+Image"} 
                                            alt={product.title}
                                            className="w-full h-48 object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://placehold.co/400x300?text=No+Image";
                                            }}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-2">{product.title}</h2>
                                        <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                                        <p className="text-indigo-600 font-semibold mb-4">₹{product.price}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">
                                                Listed on: {new Date(product.createdAt).toLocaleDateString()}
                                            </span>
                                            {deleteConfirm === product._id ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={cancelDelete}
                                                        className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => confirmDelete(product._id)}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {products.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-gray-500">You haven't listed any products yet.</p>
                                <button 
                                    onClick={() => navigate('/sell')} 
                                    className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                                >
                                    List Your First Product
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

export default History;