import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

const LoginPage = ({ setToken }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const login = () => {
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          setToken(response.authResponse.accessToken);
          setModalOpen(false);
        }
      },
      { scope: 'pages_messaging,pages_show_list' }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Messenger Automation</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Login with Facebook
        </button>
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Facebook Login</h2>
              <p className="mb-4">Click below to authenticate with Facebook.</p>
              <button
                onClick={login}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Authenticate
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="ml-4 text-gray-600 hover:text-gray-800"
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Send Messages</h1>
        <select
          onChange={(e) => setSelectedPage(e.target.value)}
          className="w-full p-2 mb-4 border rounded-lg"
        >
          <option value="">Select a Page</option>
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message (e.g., Your account is active)"
          className="w-full p-2 mb-4 border rounded-lg"
        />
        <button
          onClick={sendMessage}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
        {status && <p className="mt-4 text-center text-gray-600">{status}</p>}
      </div>
    </div>
  );
};

function App() {
  const [token, setToken] = useState('');

  useEffect(() => {
    window.FB.init({
      appId: '1022102683426026',
      version: 'v20.0',
      xfbml: true,
    });
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LoginPage setToken={setToken} />}
        />
        <Route
          path="/pages"
          element={token ? <PagesPage token={token} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;