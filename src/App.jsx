import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Usercontex } from "./UserProvider";

const API = "http://localhost:8000";

// Mock data for development
const MOCK_DATA = {
  user: {
    username: "DemoUser",
    avatar: "https://avatars.githubusercontent.com/u/583231?v=4", // GitHub octocat avatar
    repos: [
      "portfolio-website",
      "e-commerce-app",
      "weather-dashboard",
      "task-tracker",
      "blog-platform",
    ],
  },
  deployedProjects: [
    {
      id: "portfolio-website-1747415644",
      name: "Portfolio Website",
      url: "portfolio-demo.example.com",
      buildDir: "portfolio",
      path: "/projects/portfolio-website-1747415644",
    },
    {
      id: "weather-dashboard-1747423456",
      name: "Weather Dashboard",
      url: "weather-demo.example.com",
      buildDir: "weather",
      path: "/projects/weather-dashboard-1747423456",
    },
    {
      id: "task-tracker-1747432198",
      name: "Task Tracker App",
      url: "tasks-demo.example.com",
      buildDir: "tasks",
      path: "/projects/task-tracker-1747432198",
    },
  ],
};

const App = () => {
  const { user, setuser } = useContext(Usercontex);

  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [deployStatus, setDeployStatus] = useState("");
  const [deployedProjects, setDeployedProjects] = useState([]);
  const [isServerDown, setIsServerDown] = useState(false);

  useEffect(() => {
    // Check if we should use mock data (server is down)
    axios
      .get(`${API}/github/userinfo`, { withCredentials: true })
      .then((res) => {
        setuser(res.data);
        setRepos(res.data.repos || []);
        setIsServerDown(false);
      })
      .catch(() => {
        console.log("Server is unavailable, using mock data");
        setIsServerDown(true);

        // Use mock data instead
        setuser(MOCK_DATA.user);
        setRepos(MOCK_DATA.user.repos || []);
        setDeployedProjects(MOCK_DATA.deployedProjects);
      });

    // Only try fetching deployed projects if not using mock data
    if (!isServerDown) {
      fetchDeployedProjects();
    }
  }, []);

  const fetchDeployedProjects = () => {
    axios
      .get(`${API}/deployed-projects`)
      .then((res) => {
        setDeployedProjects(res.data.projects || []);
      })
      .catch((err) => {
        console.error("Failed to fetch deployed projects", err);
        // Fallback to mock data if the real API fails
        setDeployedProjects(MOCK_DATA.deployedProjects);
      });
  };

  const handleLogin = () => {
    if (isServerDown) {
      // If server is down, simulate login with mock data
      setuser(MOCK_DATA.user);
      setRepos(MOCK_DATA.user.repos || []);
      return;
    }
    window.location.href = `${API}/github/login`;
  };

  const handleLogout = () => {
    if (isServerDown) {
      setuser(null);
      setRepos([]);
      setSelectedRepo("");
      return;
    }

    axios
      .post(`${API}/logout`, {}, { withCredentials: true })
      .then(() => {
        setuser(null);
        setRepos([]);
        setSelectedRepo("");
      })
      .catch((err) => console.error(err));
  };

  const handleDeploy = () => {
    if (!selectedRepo) return alert("Please select a repo.");

    if (isServerDown) {
      // Simulate deployment success with mock data
      setDeployStatus(`✅ Deployed: ${selectedRepo} successfully!`);

      // Add the newly "deployed" project to the list
      const newProject = {
        id: `${selectedRepo}-${Math.floor(Date.now() / 1000)}`,
        name: selectedRepo,
        url: `${selectedRepo.toLowerCase()}-demo.example.com`,
        buildDir: selectedRepo.toLowerCase(),
        path: `/projects/${selectedRepo}-${Math.floor(Date.now() / 1000)}`,
      };

      setDeployedProjects([...deployedProjects, newProject]);
      return;
    }

    axios
      .post(
        `${API}/deploy`,
        { repo_name: selectedRepo },
        { withCredentials: true }
      )
      .then((res) => {
        setDeployStatus(`✅ Deployed: ${res.data.message || "Success"}`);
        fetchDeployedProjects(); // Refresh list
      })
      .catch((err) => {
        setDeployStatus("❌ Deploy failed");
        console.error(err);
      });
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>🚀 GitHub Auto Deployer</h1>

      {isServerDown && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#fff3cd",
            color: "#856404",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          ⚠️ Server is currently offline. Using mock data for demonstration.
        </div>
      )}

      {!user ? (
        <button onClick={handleLogin}>Login with GitHub</button>
      ) : (
        <div>
          <p>
            Welcome, <b>{user.username}</b>!
          </p>
          <img src={user.avatar} alt="Avatar" width={80} />
          <button onClick={handleLogout} style={{ marginLeft: 20 }}>
            Logout
          </button>

          <hr />

          <h2>📦 Select Repository</h2>
          <select
            onChange={(e) => setSelectedRepo(e.target.value)}
            value={selectedRepo}
          >
            <option value="">-- Choose repo --</option>
            {repos.map((repo, index) => (
              <option key={index} value={repo}>
                {repo}
              </option>
            ))}
          </select>

          <button onClick={handleDeploy} style={{ marginLeft: 10 }}>
            Deploy
          </button>

          {deployStatus && <p style={{ color: "green" }}>{deployStatus}</p>}

          <hr />
        </div>
      )}
      <h2>🗂️ Deployed Projects</h2>
      {deployedProjects.length > 0 ? (
        <ul>
          {deployedProjects.map((proj) => (
            <li key={proj.id} style={{ margin: "10px 0" }}>
              <a
                href={"http://" + proj.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "5px",
                  textDecoration: "none",
                }}
              >
                🔗 {proj.name}
              </a>
              <span
                style={{ marginLeft: "10px", color: "#666", fontSize: "14px" }}
              >
                {proj.url}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No projects deployed yet.</p>
      )}
    </div>
  );
};

export default App;
