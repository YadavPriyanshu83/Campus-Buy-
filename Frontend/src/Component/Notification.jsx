import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../utils/appSlice';

const Notification = () => {
    const dispatch = useDispatch();
    const notifications = useSelector(store => store.app.notifications);

    useEffect(() => {
        notifications.forEach(notification => {
            setTimeout(() => {
                dispatch(removeNotification(notification.id));
            }, 5000);
        });
    }, [notifications, dispatch]);

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={`p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
                        notification.type === 'success'
                            ? 'bg-green-500 text-white'
                            : notification.type === 'error'
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-500 text-white'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <button
                            onClick={() => dispatch(removeNotification(notification.id))}
                            className="ml-4 text-white hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Notification; 