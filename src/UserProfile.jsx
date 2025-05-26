import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8000/github/userinfo", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => alert("You are not logged in"));
  }, []);

  if (!user) return <h2>Loading user info...</h2>;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <img
        src={user.avatar}
        alt="avatar"
        style={{ width: 100, borderRadius: "50%" }}
      />
      <h2>Welcome, {user.username}</h2>
      <h3>Your Repositories:</h3>
      <ul style={{ listStyle: "none" }}>
        {user.repos.map((repo) => (
          <li key={repo}>{repo}</li>
        ))}
      </ul>
    </div>
  );
}
