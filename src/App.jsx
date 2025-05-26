// import React, { useContext, useEffect, useState } from "react";
// import axios from "axios";
// import { Usercontex } from "./UserProvider";

// const API = "http://localhost:8000";

// const MOCK_DATA = {
//   user: {
//     username: "DemoUser",
//     avatar: "https://avatars.githubusercontent.com/u/583231?v=4", // GitHub octocat avatar
//     repos: [
//       "portfolio-website",
//       "e-commerce-app",
//       "weather-dashboard",
//       "task-tracker",
//       "blog-platform",
//     ],
//   },
//   deployedProjects: [
//     {
//       id: "portfolio-website-1747415644",
//       name: "Portfolio Website",
//       url: "portfolio-demo.example.com",
//       buildDir: "portfolio",
//       path: "/projects/portfolio-website-1747415644",
//     },
//     {
//       id: "weather-dashboard-1747423456",
//       name: "Weather Dashboard",
//       url: "weather-demo.example.com",
//       buildDir: "weather",
//       path: "/projects/weather-dashboard-1747423456",
//     },
//     {
//       id: "task-tracker-1747432198",
//       name: "Task Tracker App",
//       url: "tasks-demo.example.com",
//       buildDir: "tasks",
//       path: "/projects/task-tracker-1747432198",
//     },
//   ],
// };

// const App = () => {
//   const { user, setuser } = useContext(Usercontex);

//   const [repos, setRepos] = useState([]);
//   const [selectedRepo, setSelectedRepo] = useState("");
//   const [deployStatus, setDeployStatus] = useState("");
//   const [deployedProjects, setDeployedProjects] = useState([]);
//   const [isServerDown, setIsServerDown] = useState(false);

//   useEffect(() => {
//     // Check if we should use mock data (server is down)
//     axios
//       .get(`${API}/github/userinfo`, { withCredentials: true })
//       .then((res) => {
//         setuser(res.data);
//         setRepos(res.data.repos || []);
//         setIsServerDown(false);
//       })
//       .catch(() => {
//         console.log("Server is unavailable, using mock data");
//         setIsServerDown(true);

//         // Use mock data instead
//         setuser(MOCK_DATA.user);
//         setRepos(MOCK_DATA.user.repos || []);
//         setDeployedProjects(MOCK_DATA.deployedProjects);
//       });

//     // Only try fetching deployed projects if not using mock data
//     if (!isServerDown) {
//       fetchDeployedProjects();
//     }
//   }, []);

//   const fetchDeployedProjects = () => {
//     axios
//       .get(`${API}/deployed-projects`)
//       .then((res) => {
//         setDeployedProjects(res.data.projects || []);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch deployed projects", err);
//         // Fallback to mock data if the real API fails
//         setDeployedProjects(MOCK_DATA.deployedProjects);
//       });
//   };

//   const handleLogin = () => {
//     if (isServerDown) {
//       setuser(MOCK_DATA.user);
//       setRepos(MOCK_DATA.user.repos || []);
//       return;
//     }
//     window.location.href = `${API}/github/login`;
//   };

//   const handleLogout = () => {
//     if (isServerDown) {
//       setuser(null);
//       setRepos([]);
//       setSelectedRepo("");
//       return;
//     }

//     axios
//       .post(`${API}/logout`, {}, { withCredentials: true })
//       .then(() => {
//         setuser(null);
//         setRepos([]);
//         setSelectedRepo("");
//       })
//       .catch((err) => console.error(err));
//   };

//   const handleDeploy = () => {
//     if (!selectedRepo) return alert("Please select a repo.");

//     if (isServerDown) {
//       // Simulate deployment success with mock data
//       setDeployStatus(`✅ Deployed: ${selectedRepo} successfully!`);

//       // Add the newly "deployed" project to the list
//       const newProject = {
//         id: `${selectedRepo}-${Math.floor(Date.now() / 1000)}`,
//         name: selectedRepo,
//         url: `${selectedRepo.toLowerCase()}-demo.example.com`,
//         buildDir: selectedRepo.toLowerCase(),
//         path: `/projects/${selectedRepo}-${Math.floor(Date.now() / 1000)}`,
//       };

//       setDeployedProjects([...deployedProjects, newProject]);
//       return;
//     }

//     axios
//       .post(
//         `${API}/deploy`,
//         { repo_name: selectedRepo },
//         { withCredentials: true }
//       )
//       .then((res) => {
//         setDeployStatus(`✅ Deployed: ${res.data.message || "Success"}`);
//         fetchDeployedProjects(); // Refresh list
//       })
//       .catch((err) => {
//         setDeployStatus("❌ Deploy failed");
//         console.error(err);
//       });
//   };

//   return (
//     <div style={{ padding: 40, fontFamily: "Arial" }}>
//       <h1>🚀 GitHub Auto Deployer</h1>

//       {isServerDown && (
//         <div
//           style={{
//             padding: "10px",
//             backgroundColor: "#fff3cd",
//             color: "#856404",
//             borderRadius: "5px",
//             marginBottom: "20px",
//           }}
//         >
//           ⚠️ Server is currently offline. Using mock data for demonstration.
//         </div>
//       )}

//       {!user ? (
//         <button onClick={handleLogin}>Login with GitHub</button>
//       ) : (
//         <div>
//           <p>
//             Welcome, <b>{user.username}</b>!
//           </p>
//           <img src={user.avatar} alt="Avatar" width={80} />
//           <button onClick={handleLogout} style={{ marginLeft: 20 }}>
//             Logout
//           </button>

//           <hr />

//           <h2>📦 Select Repository</h2>
//           <select
//             onChange={(e) => setSelectedRepo(e.target.value)}
//             value={selectedRepo}
//           >
//             <option value="">-- Choose repo --</option>
//             {repos.map((repo, index) => (
//               <option key={index} value={repo}>
//                 {repo}
//               </option>
//             ))}
//           </select>

//           <button onClick={handleDeploy} style={{ marginLeft: 10 }}>
//             Deploy
//           </button>

//           {deployStatus && <p style={{ color: "green" }}>{deployStatus}</p>}

//           <hr />
//         </div>
//       )}
//       <h2>🗂️ Deployed Projects</h2>
//       {deployedProjects.length > 0 ? (
//         <ul>
//           {deployedProjects.map((proj) => (
//             <li key={proj.id} style={{ margin: "10px 0" }}>
//               <a
//                 href={"http://" + proj.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 style={{
//                   display: "inline-block",
//                   padding: "8px 12px",
//                   backgroundColor: "#f0f0f0",
//                   borderRadius: "5px",
//                   textDecoration: "none",
//                 }}
//               >
//                 🔗 {proj.name}
//               </a>
//               <span
//                 style={{ marginLeft: "10px", color: "#666", fontSize: "14px" }}
//               >
//                 {proj.url}
//               </span>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No projects deployed yet.</p>
//       )}
//     </div>
//   );
// };

// export default App;
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Usercontex } from "./UserProvider";

const API = "http://localhost:8000";

// Mock data for development
const MOCK_DATA = {
  user: {
    username: "DemoUser",
    avatar: "https://avatars.githubusercontent.com/u/583231?v=4",
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
      deployedAt: "2025-05-20T14:30:00Z",
      status: "online",
    },
    {
      id: "weather-dashboard-1747423456",
      name: "Weather Dashboard",
      url: "weather-demo.example.com",
      buildDir: "weather",
      path: "/projects/weather-dashboard-1747423456",
      deployedAt: "2025-05-22T09:45:00Z",
      status: "online",
    },
    {
      id: "task-tracker-1747432198",
      name: "Task Tracker App",
      url: "tasks-demo.example.com",
      buildDir: "tasks",
      path: "/projects/task-tracker-1747432198",
      deployedAt: "2025-05-25T11:20:00Z",
      status: "maintenance",
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
  const [isLoading, setIsLoading] = useState(false);
  const [deployOptions, setDeployOptions] = useState({
    environment: "production",
    withTests: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("deployed");

  useEffect(() => {
    // Check if we should use mock data (server is down)
    setIsLoading(true);
    axios
      .get(`${API}/github/userinfo`, { withCredentials: true })
      .then((res) => {
        setuser(res.data);
        setRepos(res.data.repos || []);
        setIsServerDown(false);
        setIsLoading(false);
      })
      .catch(() => {
        console.log("Server is unavailable, using mock data");
        setIsServerDown(true);

        // Use mock data instead
        setuser(MOCK_DATA.user);
        setRepos(MOCK_DATA.user.repos || []);
        setDeployedProjects(MOCK_DATA.deployedProjects);
        setIsLoading(false);
      });

    // Only try fetching deployed projects if not using mock data
    if (!isServerDown) {
      fetchDeployedProjects();
    }
  }, []);

  const fetchDeployedProjects = () => {
    setIsLoading(true);
    axios
      .get(`${API}/deployed-projects`)
      .then((res) => {
        setDeployedProjects(res.data.projects || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch deployed projects", err);
        // Fallback to mock data if the real API fails
        setDeployedProjects(MOCK_DATA.deployedProjects);
        setIsLoading(false);
      });
  };

  const handleLogin = () => {
    if (isServerDown) {
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

    setIsLoading(true);
    setDeployStatus("⏳ Deploying...");

    if (isServerDown) {
      // Simulate deployment success with mock data
      setTimeout(() => {
        setDeployStatus(`✅ Deployed: ${selectedRepo} successfully!`);
        setIsLoading(false);

        // Add the newly "deployed" project to the list
        const newProject = {
          id: `${selectedRepo}-${Math.floor(Date.now() / 1000)}`,
          name: selectedRepo,
          url: `${selectedRepo.toLowerCase()}-demo.example.com`,
          buildDir: selectedRepo.toLowerCase(),
          path: `/projects/${selectedRepo}-${Math.floor(Date.now() / 1000)}`,
          deployedAt: new Date().toISOString(),
          status: "online",
        };

        setDeployedProjects([...deployedProjects, newProject]);
      }, 2000);
      return;
    }

    axios
      .post(
        `${API}/deploy`,
        {
          repo_name: selectedRepo,
          environment: deployOptions.environment,
          run_tests: deployOptions.withTests,
        },
        { withCredentials: true }
      )
      .then((res) => {
        setDeployStatus(`✅ Deployed: ${res.data.message || "Success"}`);
        fetchDeployedProjects(); // Refresh list
        setIsLoading(false);
      })
      .catch((err) => {
        setDeployStatus("❌ Deploy failed");
        console.error(err);
        setIsLoading(false);
      });
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm("Are you sure you want to delete this deployment?")) {
      setIsLoading(true);

      if (isServerDown) {
        // Simulate deletion in mock data
        setTimeout(() => {
          setDeployedProjects(
            deployedProjects.filter((p) => p.id !== projectId)
          );
          setIsLoading(false);
        }, 1000);
        return;
      }

      axios
        .delete(`${API}/deployed-projects/${projectId}`, {
          withCredentials: true,
        })
        .then(() => {
          fetchDeployedProjects();
        })
        .catch((err) => {
          console.error("Failed to delete project", err);
          setIsLoading(false);
        });
    }
  };

  const handleRedeployProject = (projectId) => {
    setIsLoading(true);

    if (isServerDown) {
      // Simulate redeployment in mock data
      setTimeout(() => {
        setDeployedProjects(
          deployedProjects.map((p) =>
            p.id === projectId
              ? { ...p, deployedAt: new Date().toISOString(), status: "online" }
              : p
          )
        );
        setIsLoading(false);
      }, 1500);
      return;
    }

    axios
      .post(`${API}/redeploy/${projectId}`, {}, { withCredentials: true })
      .then(() => {
        fetchDeployedProjects();
      })
      .catch((err) => {
        console.error("Failed to redeploy project", err);
        setIsLoading(false);
      });
  };

  // Filter projects based on search term
  const filteredProjects = deployedProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold">GitHub Auto Deployer</h1>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center">
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
                <span className="ml-2 font-medium">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {isServerDown && (
          <div className="mb-8 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0"></div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  Server is currently offline. Using mock data for demonstration
                  purposes.
                </p>
              </div>
            </div>
          </div>
        )}

        {!user ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Welcome to Hoster
              </h2>
              <p className="mt-2 text-gray-600">
                Deploy your GitHub repositories with ease
              </p>
              <button
                onClick={handleLogin}
                className="mt-8 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login with GitHub
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="p-6 md:p-8 w-full">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Deploy a Repository
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="repo-select"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Select Repository
                      </label>
                      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                        <select
                          id="repo-select"
                          onChange={(e) => setSelectedRepo(e.target.value)}
                          value={selectedRepo}
                          className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">-- Choose a repository --</option>
                          {repos.map((repo, index) => (
                            <option key={index} value={repo}>
                              {repo}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleDeploy}
                          disabled={isLoading || !selectedRepo}
                          className={`flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            isLoading || !selectedRepo
                              ? "bg-indigo-300 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          }`}
                        >
                          {isLoading ? <>Deploying...</> : "Deploy"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {deployStatus && (
                    <div
                      className={`mt-6 p-3 rounded-md ${
                        deployStatus.includes("✅")
                          ? "bg-green-50 text-green-700"
                          : deployStatus.includes("❌")
                          ? "bg-red-50 text-red-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {deployStatus}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Deployed Projects Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Deployed Projects
                  </h2>

                  <div className="mt-3 md:mt-0">
                    <div className="relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Search projects..."
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab("deployed")}
                      className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "deployed"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      All Projects
                    </button>
                    <button
                      onClick={() => setActiveTab("online")}
                      className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "online"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Online
                    </button>
                    <button
                      onClick={() => setActiveTab("maintenance")}
                      className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "maintenance"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Maintenance
                    </button>
                  </nav>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <svg
                      className="animate-spin h-8 w-8 text-indigo-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : filteredProjects.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Project
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            URL
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Last Deployed
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProjects
                          .filter(
                            (project) =>
                              activeTab === "deployed" ||
                              project.status === activeTab
                          )
                          .map((project) => (
                            <tr key={project.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-md flex items-center justify-center">
                                    <svg
                                      className="h-6 w-6 text-indigo-600"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                      />
                                    </svg>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {project.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {project.buildDir}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <a
                                  href={"http://" + project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-indigo-600 hover:text-indigo-900 hover:underline"
                                >
                                  {project.url}
                                </a>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    project.status === "online"
                                      ? "bg-green-100 text-green-800"
                                      : project.status === "maintenance"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {project.status === "online" && (
                                    <svg
                                      className="mr-1.5 h-2 w-2 text-green-400"
                                      fill="currentColor"
                                      viewBox="0 0 8 8"
                                    >
                                      <circle cx="4" cy="4" r="3" />
                                    </svg>
                                  )}
                                  {project.status === "maintenance" && (
                                    <svg
                                      className="mr-1.5 h-2 w-2 text-yellow-400"
                                      fill="currentColor"
                                      viewBox="0 0 8 8"
                                    >
                                      <circle cx="4" cy="4" r="3" />
                                    </svg>
                                  )}
                                  {project.status === "offline" && (
                                    <svg
                                      className="mr-1.5 h-2 w-2 text-red-400"
                                      fill="currentColor"
                                      viewBox="0 0 8 8"
                                    >
                                      <circle cx="4" cy="4" r="3" />
                                    </svg>
                                  )}
                                  {project.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {project.deployedAt
                                  ? formatDate(project.deployedAt)
                                  : "Unknown"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() =>
                                      handleRedeployProject(project.id)
                                    }
                                    className="text-indigo-600 hover:text-indigo-900"
                                    title="Redeploy"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteProject(project.id)
                                    }
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No projects found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by deploying your first project.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-sm text-gray-400">
                &copy; 2025 Hoster. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
