import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

const LoginPage = ({ setToken }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  const login = () => {
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          setToken(response.authResponse.accessToken);
          setModalOpen(false);
        } else {
          setError('Facebook login failed. Please try again.');
        }
      },
      { scope: 'pages_messaging,pages_show_list' }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Messenger Automation</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c2.76 0 5.26-1.12 7.07-2.93l-1.41-1.41C16.24 19.08 14.24 20 12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8c0 1.24-.28 2.41-.76 3.45l1.47 1.47C21.47 15.18 22 13.62 22 12c0-5.52-4.48-10-10-10zm-1 14v-2h2v2h-2zm0-4V8h2v4h-2z"/>
          </svg>
          Login with Facebook
        </button>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Facebook Authentication</h2>
              <p className="text-gray-600 mb-6">Click below to log in with your Facebook account.</p>
              <button
                onClick={login}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Authenticate
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="w-full mt-4 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PagesPage = ({ token }) => {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (token) {
      axios
        .get('https://butjwogzvvoulankayaj.supabase.co/functions/v1/pages', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setPages(res.data))
        .catch((err) => setStatus('Error fetching pages: ' + err.message));
    }
  }, [token]);

  const sendMessage = () => {
    if (!selectedPage || !message) {
      setStatus('Please select a Page and enter a message.');
      return;
    }
    axios
      .post(
        'https://butjwogzvvoulankayaj.supabase.co/functions/v1/send-messages',
        { pageId: selectedPage, message },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => setStatus('Messages queued successfully'))
      .catch((err) => setStatus('Error sending messages: ' + err.message));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 z-40`}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Your Pages</h2>
        </div>
        <div className="p-4">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => {
                setSelectedPage(page.id);
                setSidebarOpen(false);
              }}
              className={`w-full text-left p-2 rounded-lg mb-2 ${
                selectedPage === page.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              {page.name}
            </button>
          ))}
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-4 md:ml-64">
        <button
          className="md:hidden bg-blue-600 text-white p-2 rounded-lg mb-4"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? 'Close' : 'Open'} Pages
        </button>
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Send Messages</h1>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Selected Page</label>
            <p className="p-2 border rounded-lg">
              {pages.find((p) => p.id === selectedPage)?.name || 'No Page Selected'}
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message (e.g., Your account is active)"
              className="w-full p-3 border rounded-lg resize-y min-h-[100px]"
            />
          </div>
          <button
            onClick={sendMessage}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
          >
            Send Messages
          </button>
          {status && (
            <p
              className={`mt-4 text-center ${
                status.includes('Error') ? 'text-red-500' : 'text-green-500'
              }`}
            >
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('fbToken') || '');

  useEffect(() => {
    window.FB.init({
      appId: '1022102683426026',
      version: 'v20.0',
      xfbml: true,
    });
    if (token) localStorage.setItem('fbToken', token);
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage setToken={setToken} />} />
        <Route
          path="/pages"
          element={token ? <PagesPage token={token} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;