import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/DashBoard";
import Profile from "./components/Profile";

import MyPage from "./components/MyPage";
import MatchProfile from "./components/MatchProfile";
import Message from "./components/Message";
import ChatHistory from './components/ChatHistory';
import AllRooms from "./pages/AllRooms";
import RoomDetails from "./pages/RoomDetails";
import BookingForm from "./pages/BookingForm";
import MyBookings from "./pages/MyBookings";
import MyRooms from "./pages/MyRooms";
import CreateRoom from "./pages/CreateRoom";
import EditRoom from "./pages/EditRoom.jsx";
import ReceivedBookings from "./pages/ReceivedBookings.jsx";
import SendMessage from "./pages/SendMessages";
import Contact from "./pages/contact.jsx"; 


import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/rooms" element={<AllRooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/send-message/:id" element={<SendMessage />} />
          <Route path="/contact" element={<Contact />} />

        

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
       
          <Route
            path="/my-page"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <MatchProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/match"
            element={
              <ProtectedRoute>
                <MatchProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/message/:id"
            element={
              <ProtectedRoute>
                <Message />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatHistory />
              </ProtectedRoute>
            }
          />

          {/* Room Management Routes */}
          <Route
            path="/rooms/:id/book"
            element={
              <ProtectedRoute>
                <BookingForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-room"
            element={
              <ProtectedRoute>
                <CreateRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms/new"
            element={
              <ProtectedRoute>
                <CreateRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-rooms"
            element={
              <ProtectedRoute>
                <MyRooms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms/:id/edit"
            element={
              <ProtectedRoute>
                <EditRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-rooms/received"
            element={
              <ProtectedRoute>
                <ReceivedBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-listing"
            element={
              <ProtectedRoute>
                <CreateRoom />
              </ProtectedRoute>
            }
          />
        </Routes>
      <ToastContainer position="bottom-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </Router>
    </AuthProvider>
  );
};

export default App;