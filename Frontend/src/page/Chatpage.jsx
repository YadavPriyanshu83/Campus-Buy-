import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../utils/authUtils';

const socket = io('http://localhost:5000');

const Chatpage = () => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [deletedMessages, setDeletedMessages] = useState({});
  const [userProfiles, setUserProfiles] = useState({});
  const bottomRef = useRef();
  
  const { user } = useAuth();
  const currentUser = user?.name || 'Anonymous';
  const profileImage = user?.profileImage || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
  const whatsappNumber = user?.whatsapp || '';

  useEffect(() => {
    axios.get('http://localhost:5000/api/messages')
      .then(res => {
        const processedMessages = res.data.map(msg => ({
          ...msg,
          senderImage: msg.senderImage || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
          whatsappNumber: msg.whatsappNumber || ''
        }));
        setMessages(processedMessages);
      })
      .catch(err => console.log('Error fetching messages:', err));

    socket.on('receive_message', (msg) => {
      const processedMsg = {
        ...msg,
        senderImage: msg.senderImage || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
        whatsappNumber: msg.whatsappNumber || ''
      };
      setMessages(prev => [...prev, processedMsg]);
    });

    socket.on('delete_message', (messageId, deletedInfo) => {
      setMessages(prev => {
        const deletedMsg = prev.find(msg => msg._id === messageId);
        if (deletedMsg && deletedMsg.sender === currentUser) {
          setDeletedMessages(prevDeleted => ({
            ...prevDeleted,
            [messageId]: {
              message: deletedMsg,
              deletedAt: new Date(),
              deleteTime: deletedInfo?.deleteTime || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            }
          }));
        }
        return prev.filter(msg => msg._id !== messageId);
      });
    });

    return () => {
      socket.off('receive_message');
      socket.off('delete_message');
    };
  }, [currentUser]);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/all-users');
        const profiles = {};
        response.data.forEach(user => {
          profiles[user.name] = user.whatsapp || '';
        });
        setUserProfiles(profiles);
      } catch (error) {
        console.error('Error fetching user profiles:', error);
      }
    };
    fetchUserProfiles();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMsg.trim()) return;

    const messageData = {
      text: newMsg,
      sender: currentUser,
      replyTo: replyingTo?._id || null,
      senderImage: profileImage,
      whatsappNumber: whatsappNumber,
      deleteTime: null
    };

    socket.emit('send_message', messageData);
    setNewMsg('');
    setReplyingTo(null);
  };

  const deleteMessage = async (id) => {
    try {
      const deleteTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      await axios.delete(`http://localhost:5000/api/messages/${id}?deleteTime=${deleteTime}`);
    } catch (err) {
      console.log('Error deleting message:', err);
    }
  };
  
  const isRecentlyDeleted = (messageId) => {
    if (!deletedMessages[messageId]) return false;
    
    const deletedAt = new Date(deletedMessages[messageId].deletedAt);
    const oneHour = 60 * 60 * 1000;
    return (new Date() - deletedAt) <= oneHour;
  };

  const canDelete = (timestamp) => {
    const oneHour = 60 * 60 * 1000;
    return Date.now() - new Date(timestamp).getTime() <= oneHour;
  };

  const getMessageById = (id) => messages.find(msg => msg._id === id);

  return (
    <div className="chat-dropdown-container flex flex-col h-full w-full">
      <div className="bg-white rounded">
        <div className="flex items-center gap-2 p-2 border-b border-gray-200">
          <img 
            src={profileImage} 
            alt="Profile" 
            className="w-6 h-6 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="text-xs font-medium">{currentUser}</span>
            {whatsappNumber && (
              <span className="text-[10px] text-gray-500">{whatsappNumber}</span>
            )}
          </div>
        </div>
        
        {replyingTo && (
          <div className="bg-indigo-50 p-1.5 mb-2 rounded flex justify-between items-center">
            <div className="text-xs">
              <span className="font-medium">Replying to {replyingTo.sender}:</span> {replyingTo.text.substring(0, 30)}{replyingTo.text.length > 30 ? '...' : ''}
            </div>
            <button 
              onClick={() => setReplyingTo(null)}
              className="text-gray-500 hover:text-gray-700 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Update the message container to maintain consistent spacing */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 max-h-[300px] sm:max-h-[400px] no-scrollbar">
          {/* Regular messages */}
          {messages.map((msg, index) => {
            const repliedMessage = getMessageById(msg.replyTo);
            const isCurrentUser = msg.sender === currentUser;
            const msgImage = msg.senderImage || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
            const msgWhatsapp = msg.whatsappNumber || userProfiles[msg.sender] || 'No WhatsApp';
            
            return (
              <div 
                key={msg._id || index} 
                className={`message-item ${isCurrentUser ? 'flex justify-end' : 'flex justify-start'} mb-3`}
                style={{minHeight: 'auto'}}
              >
                {!isCurrentUser && (
                  <div className="mr-2 flex-shrink-0">
                    <img 
                      src={msgImage} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                )}
                <div className={`p-2 sm:p-3 rounded-lg max-w-[85%] sm:max-w-[80%] shadow-md ${isCurrentUser ? 'bg-blue-100' : 'bg-white border border-gray-200'}`}>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-semibold text-xs text-gray-700">{msg.sender}</span>
                    <span className="text-[10px] text-indigo-600 font-medium">
                      📱 +{msgWhatsapp}
                    </span>
                  </div>
                  
                  {repliedMessage && (
                    <div className="bg-gray-100 p-1 rounded mb-1 text-xs">
                      <span className="font-medium">Replying to {repliedMessage.sender}:</span> {repliedMessage.text.substring(0, 50)}{repliedMessage.text.length > 50 ? '...' : ''}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-800">{msg.text}</div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    
                    {isCurrentUser && canDelete(msg.timestamp) && (
                      <button
                        onClick={() => deleteMessage(msg._id)}
                        className="text-red-500 hover:text-red-700 text-[10px] ml-2"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                {isCurrentUser && (
                  <div className="ml-2 flex-shrink-0">
                    <img 
                      src={msgImage} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Deleted messages */}
          {Object.entries(deletedMessages).map(([messageId, data]) => {
            if (isRecentlyDeleted(messageId)) {
              const msg = data.message;
              const msgImage = msg.senderImage || profileImage;
              const deleteTime = data.deleteTime || new Date(data.deletedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
              
              return (
                <div 
                  key={`deleted-${messageId}`} 
                  className="mb-2 flex justify-end"
                >
                  <div className="p-1.5 sm:p-2 rounded-lg max-w-[85%] sm:max-w-[80%] shadow-sm bg-gray-100 opacity-70">
                    <div className="flex justify-end flex-col">
                      <div className="flex items-start gap-1">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-xs text-gray-700">{msg.sender}</span>
                            <span className="text-[10px] text-gray-500">+{msg.whatsappNumber || userProfiles[msg.sender] || 'No WhatsApp'}</span>
                          </div>
                          <span className="text-xs italic text-gray-500">Message deleted at {deleteTime}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                  </div>
                  <div className="ml-1 flex-shrink-0">
                    <img 
                      src={msgImage} 
                      alt="Profile" 
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  </div>
                </div>
              );
            }
            return null;
          })}
          
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-1 mt-2">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-indigo-300"
          />
          <button
            onClick={sendMessage}
            className="bg-indigo-600 text-white px-2 py-1 text-xs rounded hover:bg-indigo-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatpage;
