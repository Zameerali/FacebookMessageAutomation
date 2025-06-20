import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- Login Page ---
const LoginPage = ({ setToken }) => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in
    window.FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
        setToken(response.authResponse.accessToken);
        localStorage.setItem('fbToken', response.authResponse.accessToken);
        navigate('/pages');
      }
    });
  }, [navigate, setToken]);

  const login = () => {
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          const token = response.authResponse.accessToken;
          setToken(token);
          localStorage.setItem('fbToken', token);
          navigate('/pages');
        } else {
          setError('Facebook login failed. Please try again.');
        }
      },
      { scope: 'pages_messaging,pages_show_list' }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Messenger Automation</h1>
        <button
          onClick={login}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="..." />
          </svg>
          Login with Facebook
        </button>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
};

// --- Pages Page ---
const PagesPage = ({ token, logout }) => {
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
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Your Pages</h2>
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-800 font-semibold text-sm"
          >
            Logout
          </button>
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
              placeholder="Enter message"
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

// --- App Component ---
function App() {
  const [token, setToken] = useState(localStorage.getItem('fbToken') || '');

  useEffect(() => {
    // Initialize FB SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: '1022102683426026',
        version: 'v20.0',
        xfbml: true,
      });
    };

    // Load SDK
    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }, []);

  const logout = () => {
    window.FB.logout(() => {
      localStorage.removeItem('fbToken');
      setToken('');
      window.location.href = '/';
    });
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage setToken={setToken} />} />
        <Route
          path="/pages"
          element={token ? <PagesPage token={token} logout={logout} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
