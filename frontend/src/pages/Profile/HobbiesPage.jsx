// src/pages/Profile/HobbiesPage.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { FaRegSmile, FaRegCalendarAlt, FaCheck } from "react-icons/fa";
import { AppContext } from "../../context/AppContext";
import { AuthContext } from "../../context/AuthContext";

const HobbiesPage = () => {
  const { backendUrl } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    type: "hobby", // default is hobby
    title: "",
    description: "",
    startTime: "",
    endTime: ""
  });
  const [weeklyHours, setWeeklyHours] = useState(0);

  // Fetch activities from backend
  const fetchActivities = () => {
    if (user) {
      axios
        .get(`${backendUrl}/api/selfcare`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => {
          const sortedActivities = res.data.activities.sort(
            (a, b) => new Date(a.startTime) - new Date(b.startTime)
          );
          setActivities(sortedActivities);
          calculateWeeklyHours(sortedActivities);
        })
        .catch((err) => console.error("Error fetching activities:", err));
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [backendUrl, user]);

  const handleChange = (e) => {
    setNewActivity({ ...newActivity, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newActivity.startTime || !newActivity.endTime) {
      console.error("Start time and end time are required.");
      return;
    }
    axios
      .post(`${backendUrl}/api/selfcare`, newActivity, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        fetchActivities();
        setNewActivity({ type: "hobby", title: "", description: "", startTime: "", endTime: "" });
      })
      .catch((err) => console.error("Error creating activity:", err));
  };

  const handleComplete = (activityId) => {
    axios
      .put(`${backendUrl}/api/selfcare/${activityId}`, { completed: true }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => fetchActivities())
      .catch((err) => console.error("Error completing activity:", err));
  };

  // Calculate overall hours for completed activities in the current week
  const calculateWeeklyHours = (activities) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    let totalHours = 0;
    activities.forEach((activity) => {
      if (activity.completed && new Date(activity.startTime) >= startOfWeek) {
        totalHours += activity.duration || 0;
      }
    });
    setWeeklyHours(totalHours);
  };

  const incompleteActivities = activities.filter((act) => !act.completed);
  const completeActivities = activities.filter((act) => act.completed);

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg border border-orange-100 transform transition-all duration-500 hover:scale-105 relative">
      {/* Header: Top Right */}
      <div className="sm:static md:absolute top-4 right-4 flex flex-col items-center">
        <img
          src={user?.profileImage || "https://via.placeholder.com/40"}
          alt="User Profile"
          className="w-10 h-10 rounded-full object-cover border border-orange-300"
        />
        <p className="mt-1 text-xs font-medium text-orange-600">{user?.name}</p>
      </div>

      {/* Main Header */}
      <h1 className="pt-12 text-3xl font-bold text-orange-600 mb-8 text-center animate-fadeIn">
        Hobbies & Personal Growth
      </h1>
      
      {/* Centered Add Activity Form */}
      <div className="flex justify-center mb-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 animate-fadeIn">
          {/* Dropdown for selecting activity type */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Type</label>
            <select
              name="type"
              value={newActivity.type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded transition-colors focus:border-orange-500 text-sm"
            >
              <option value="hobby">Hobby</option>
              <option value="fitness">Fitness</option>
              <option value="mental health">Mental Health</option>
            </select>
          </div>
          <input
            type="text"
            name="title"
            value={newActivity.title}
            onChange={handleChange}
            placeholder="Activity Title"
            className="w-full p-2 border border-gray-300 rounded transition-colors focus:border-orange-500"
            required
          />
          <textarea
            name="description"
            value={newActivity.description}
            onChange={handleChange}
            placeholder="Activity Description"
            className="w-full p-2 border border-gray-300 rounded transition-colors focus:border-orange-500"
          ></textarea>
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm mb-1">Start Time</label>
              <input
                type="datetime-local"
                name="startTime"
                value={newActivity.startTime}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded transition-colors focus:border-orange-500"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 text-sm mb-1">End Time</label>
              <input
                type="datetime-local"
                name="endTime"
                value={newActivity.endTime}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded transition-colors focus:border-orange-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-center my-4">
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-1 rounded text-sm hover:bg-orange-600 transition-colors duration-300"
            >
              Add Activity
            </button>
          </div>
        </form>
      </div>
      
      {/* Activities List in Two Columns */}
      <div className="animate-fadeIn mb-8">
        <h2 className="text-2xl font-semibold text-orange-600 mb-4 text-center">
          Your Activities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Incomplete Activities */}
          <div>
            <h3 className="text-xl font-semibold text-orange-600 mb-2 text-center">Incomplete</h3>
            {incompleteActivities.length === 0 ? (
              <p className="text-sm text-center">No incomplete activities.</p>
            ) : (
              incompleteActivities.map((activity) => (
                <div
                  key={activity._id}
                  className="mb-4 p-3 border rounded flex flex-col transition-all duration-300 hover:scale-105 bg-white border-gray-300 text-sm"
                >
                  <h3 className="font-bold">{activity.title}</h3>
                  <p>{activity.description}</p>
                  <p className="text-xs">
                    <strong>Start:</strong> {new Date(activity.startTime).toLocaleString()}
                  </p>
                  <p className="text-xs">
                    <strong>End:</strong> {new Date(activity.endTime).toLocaleString()}
                  </p>
                  <p className="text-xs">
                    <strong>Duration:</strong> {activity.duration ? activity.duration.toFixed(2) : 0} hrs
                  </p>
                  <p className="text-xs">
                    <strong>Type:</strong> {activity.type}
                  </p>
                  <button
                    onClick={() => handleComplete(activity._id)}
                    className="mt-2 flex items-center justify-center bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                  >
                    <FaCheck className="mr-1" /> Complete
                  </button>
                </div>
              ))
            )}
          </div>
          {/* Completed Activities */}
          <div>
            <h3 className="text-xl font-semibold text-orange-600 mb-2 text-center">Completed</h3>
            {completeActivities.length === 0 ? (
              <p className="text-sm text-center">No completed activities.</p>
            ) : (
              completeActivities.map((activity) => (
                <div
                  key={activity._id}
                  className="mb-4 p-3 border rounded flex flex-col transition-all duration-300 hover:scale-105 bg-green-100 border-green-300 text-sm"
                >
                  <h3 className="font-bold">{activity.title}</h3>
                  <p>{activity.description}</p>
                  <p className="text-xs">
                    <strong>Start:</strong> {new Date(activity.startTime).toLocaleString()}
                  </p>
                  <p className="text-xs">
                    <strong>End:</strong> {new Date(activity.endTime).toLocaleString()}
                  </p>
                  <p className="text-xs">
                    <strong>Duration:</strong> {activity.duration ? activity.duration.toFixed(2) : 0} hrs
                  </p>
                  <p className="text-xs">
                    <strong>Type:</strong> {activity.type}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Overall Activities Summary Box */}
      <div className="mt-8">
        <div className="mx-auto inline-block p-3 bg-orange-50 border border-orange-300 rounded shadow text-sm transition-transform duration-300 hover:scale-105 animate-fadeIn">
          <div className="flex items-center justify-center space-x-1">
            <FaRegCalendarAlt className="text-orange-600" />
            <h3 className="text-lg font-bold text-orange-600">
              Weekly Hours: {weeklyHours.toFixed(2)} hrs
            </h3>
          </div>
        </div>
      </div>
      
      {/* Inline CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HobbiesPage;
