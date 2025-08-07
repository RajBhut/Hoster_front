import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
axios.defaults.withCredentials = true; // Ensure cookies are sent with requests
import { Usercontex } from "./UserProvider";
import { useParams } from "react-router-dom";

const API = "http://localhost:8000/api";

const MOCK_DATA = {
  user: {
    login: "DemoUser",
    name: "Demo User",
    email: "demo@example.com",
    avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
    public_repos: 25,
    followers: 10,
    following: 15,
    bio: "Demo user for testing",
    company: "Demo Company",
    location: "Demo City",
  },
  repos: [
    {
      name: "portfolio-website",
      full_name: "DemoUser/portfolio-website",
      owner: "DemoUser",
      description: "A portfolio website built with React",
      clone_url: "https://github.com/DemoUser/portfolio-website.git",
      updated_at: "2025-05-20T14:30:00Z",
      language: "JavaScript",
    },
    {
      name: "e-commerce-app",
      full_name: "DemoUser/e-commerce-app",
      owner: "DemoUser",
      description: "E-commerce application",
      clone_url: "https://github.com/DemoUser/e-commerce-app.git",
      updated_at: "2025-05-22T09:45:00Z",
      language: "TypeScript",
    },
    {
      name: "weather-dashboard",
      full_name: "DemoUser/weather-dashboard",
      owner: "DemoUser",
      description: "Weather dashboard app",
      clone_url: "https://github.com/DemoUser/weather-dashboard.git",
      updated_at: "2025-05-25T11:20:00Z",
      language: "JavaScript",
    },
    {
      name: "python-api",
      full_name: "DemoUser/python-api",
      owner: "DemoUser",
      description: "A Python API project",
      clone_url: "https://github.com/DemoUser/python-api.git",
      updated_at: "2025-05-18T16:30:00Z",
      language: "Python",
    },
    {
      name: "express-server",
      full_name: "DemoUser/express-server",
      owner: "DemoUser",
      description: "Express.js REST API",
      clone_url: "https://github.com/DemoUser/express-server.git",
      updated_at: "2025-05-22T10:15:00Z",
      language: "JavaScript",
    },
    {
      name: "fastapi-backend",
      full_name: "DemoUser/fastapi-backend",
      owner: "DemoUser",
      description: "FastAPI Python backend",
      clone_url: "https://github.com/DemoUser/fastapi-backend.git",
      updated_at: "2025-05-21T14:20:00Z",
      language: "Python",
    },
  ],
  builds: [
    {
      id: "DemoUser_portfolio-website",
      name: "DemoUser/portfolio-website",
      path: "./builds/DemoUser_portfolio-website",
      file_count: 15,
      has_index: true,
      files: ["index.html", "static", "asset-manifest.json"],
      s3_url:
        "https://demo-bucket.s3-website-us-east-1.amazonaws.com/portfolio-website",
    },
    {
      id: "DemoUser_weather-dashboard",
      name: "DemoUser/weather-dashboard",
      path: "./builds/DemoUser_weather-dashboard",
      file_count: 22,
      has_index: true,
      files: ["index.html", "static", "asset-manifest.json"],
      s3_url:
        "https://demo-bucket.s3-website-us-east-1.amazonaws.com/weather-dashboard",
    },
  ],
  runningBackends: [
    {
      owner: "DemoUser",
      repo: "express-server",
      container_id: "demo_container_1",
      local_url: "http://localhost:3001",
      port: 3001,
      backend_type: "nodejs",
      status: "running",
      uptime: 3600,
    },
    {
      owner: "DemoUser",
      repo: "fastapi-backend",
      container_id: "demo_container_2",
      local_url: "http://localhost:8001",
      port: 8001,
      backend_type: "python",
      status: "running",
      uptime: 1800,
    },
  ],
};

const App = () => {
  const { user, setuser } = useContext(Usercontex);

  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [buildStatus, setBuildStatus] = useState("");
  const [builds, setBuilds] = useState([]);
  const [deployedProjects, setDeployedProjects] = useState([]);
  const [isServerDown, setIsServerDown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buildOptions, setBuildOptions] = useState({
    environment: "production",
    withTests: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("builds");

  // Enhanced state for project detection
  const [reactStatus, setReactStatus] = useState({});
  const [backendStatus, setBackendStatus] = useState({});
  const [checkingProject, setCheckingProject] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [selectedRepoForCheck, setSelectedRepoForCheck] = useState(null);

  // New state for backend container management
  const [runningBackends, setRunningBackends] = useState([]);
  const [selectedBackendRepo, setSelectedBackendRepo] = useState("");
  const [backendOperationStatus, setBackendOperationStatus] = useState("");
  const [containerLogs, setContainerLogs] = useState({});
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLogsRepo, setSelectedLogsRepo] = useState(null);

  // Update your useEffect in the React component
  useEffect(() => {
    // Check for auth error in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const authError = urlParams.get("error");

    setIsLoading(true);
    axios
      .get(`${API}/user/me`, { withCredentials: true })
      .then((res) => {
        console.log("User authenticated:", res.data);
        setuser(res.data.user);
        setIsServerDown(false);
        fetchRepos();
        fetchBuilds();
        fetchDeployedProjects();
        fetchRunningBackends();
      })
      .catch((error) => {
        console.log("Authentication failed:", error.response?.status);
        if (error.response?.status === 401) {
          console.log("User not authenticated");
        } else {
          console.log("Server is unavailable, using mock data");
          setIsServerDown(true);
          setuser(MOCK_DATA.user);
          setRepos(MOCK_DATA.repos);
          setBuilds(MOCK_DATA.builds);
          setRunningBackends(MOCK_DATA.runningBackends);
          fetchDeployedProjects(); // This will load mock deployed projects
        }
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (window.location.pathname === "/" && !urlParams.get("error")) {
      // Clear URL params after handling
      window.history.replaceState({}, document.title, window.location.pathname);

      // Check if user is now authenticated
      axios
        .get(`${API}/user/me`, { withCredentials: true })
        .then((res) => {
          setuser(res.data.user);
          console.log("Auth successful after redirect");
        })
        .catch(() => {
          console.log("Auth failed after redirect");
        });
    }
  }, []);

  const fetchRepos = () => {
    axios
      .get(`${API}/project/repos`, { withCredentials: true })
      .then((res) => {
        setRepos(res.data.repos || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch repositories", err);
        setRepos(MOCK_DATA.repos);
        setIsLoading(false);
      });
  };

  const fetchBuilds = () => {
    axios
      .get(`${API}/project/builds`, { withCredentials: true })
      .then((res) => {
        setBuilds(res.data.builds || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch builds", err);
        setBuilds(MOCK_DATA.builds);
        setIsLoading(false);
      });
  };

  const fetchDeployedProjects = () => {
    if (isServerDown) {
      // Mock deployed projects for demo
      const mockDeployedProjects = [
        {
          owner: "DemoUser",
          repo: "portfolio-website",
          project_path: "DemoUser/portfolio-website",
          has_index: true,
          has_static: true,
          file_count: 15,
          website_url:
            "https://demo-bucket.s3-website-us-east-1.amazonaws.com/projects/DemoUser/portfolio-website/",
          direct_url:
            "https://demo-bucket.s3.us-east-1.amazonaws.com/projects/DemoUser/portfolio-website/",
          status: "✅ Complete",
        },
        {
          owner: "DemoUser",
          repo: "weather-dashboard",
          project_path: "DemoUser/weather-dashboard",
          has_index: true,
          has_static: false,
          file_count: 8,
          website_url:
            "https://demo-bucket.s3-website-us-east-1.amazonaws.com/projects/DemoUser/weather-dashboard/",
          direct_url:
            "https://demo-bucket.s3.us-east-1.amazonaws.com/projects/DemoUser/weather-dashboard/",
          status: "⚠️ Missing Assets",
        },
      ];
      setDeployedProjects(mockDeployedProjects);
      return;
    }

    axios
      .get(`${API}/project/list-deployed-projects`, { withCredentials: true })
      .then((res) => {
        setDeployedProjects(res.data.projects || []);
      })
      .catch((err) => {
        console.error("Failed to fetch deployed projects", err);
        setDeployedProjects([]);
      });
  };

  // New function to fetch running backend containers
  const fetchRunningBackends = () => {
    if (isServerDown) {
      setRunningBackends(MOCK_DATA.runningBackends);
      return;
    }

    axios
      .get(`${API}/project/backend-status`, { withCredentials: true })
      .then((res) => {
        setRunningBackends(res.data.running_backends || []);
      })
      .catch((err) => {
        console.error("Failed to fetch running backends", err);
        setRunningBackends([]);
      });
  };

  // Function to check if repository is React
  const checkReactProject = async (repoName) => {
    if (isServerDown) {
      // Mock React check for demo
      const mockReactCheck = {
        is_react: Math.random() > 0.3, // 70% chance of being React
        project_path: Math.random() > 0.5 ? "" : "frontend",
        details: {
          project_type: "Create React App",
          has_react: true,
          has_build_script: true,
          has_start_script: true,
        },
      };
      setReactStatus((prev) => ({ ...prev, [repoName]: mockReactCheck }));
      return mockReactCheck;
    }

    const selectedRepoObj = repos.find((repo) => repo.name === repoName);
    if (!selectedRepoObj) return null;

    setCheckingProject(true);
    try {
      const response = await axios.get(
        `${API}/project/check-react/${selectedRepoObj.owner}/${selectedRepoObj.name}`,
        { withCredentials: true }
      );

      const reactCheck = response.data;
      setReactStatus((prev) => ({ ...prev, [repoName]: reactCheck }));
      setCheckingProject(false);
      return reactCheck;
    } catch (error) {
      console.error("Failed to check React project", error);
      const errorStatus = { is_react: false, error: error.message };
      setReactStatus((prev) => ({ ...prev, [repoName]: errorStatus }));
      setCheckingProject(false);
      return errorStatus;
    }
  };

  // New function to check if repository is a backend project
  const checkBackendProject = async (repoName) => {
    if (isServerDown) {
      // Mock backend check for demo
      const mockBackendCheck = {
        is_backend: Math.random() > 0.4, // 60% chance of being backend
        backend_type: Math.random() > 0.5 ? "nodejs" : "python",
        project_path: Math.random() > 0.7 ? "backend" : "",
        details: {
          framework: Math.random() > 0.5 ? "Express.js" : "FastAPI",
          has_start_script: true,
        },
      };
      setBackendStatus((prev) => ({ ...prev, [repoName]: mockBackendCheck }));
      return mockBackendCheck;
    }

    const selectedRepoObj = repos.find((repo) => repo.name === repoName);
    if (!selectedRepoObj) return null;

    setCheckingProject(true);
    try {
      const response = await axios.get(
        `${API}/project/check-backend/${selectedRepoObj.owner}/${selectedRepoObj.name}`,
        { withCredentials: true }
      );

      const backendCheck = response.data;
      setBackendStatus((prev) => ({ ...prev, [repoName]: backendCheck }));
      setCheckingProject(false);
      return backendCheck;
    } catch (error) {
      console.error("Failed to check backend project", error);
      const errorStatus = { is_backend: false, error: error.message };
      setBackendStatus((prev) => ({ ...prev, [repoName]: errorStatus }));
      setCheckingProject(false);
      return errorStatus;
    }
  };

  // Enhanced repository selection with project type checking
  const handleRepoSelection = async (repoName, type = "react") => {
    if (type === "react") {
      setSelectedRepo(repoName);
      setBuildStatus("");
    } else {
      setSelectedBackendRepo(repoName);
      setBackendOperationStatus("");
    }

    if (!repoName) return;

    // Check if we already know the project status
    const statusMap = type === "react" ? reactStatus : backendStatus;
    if (statusMap[repoName]) {
      return;
    }

    // Check project status
    setSelectedRepoForCheck(repoName);
    const projectCheck =
      type === "react"
        ? await checkReactProject(repoName)
        : await checkBackendProject(repoName);

    const isValidProject =
      type === "react" ? projectCheck?.is_react : projectCheck?.is_backend;

    if (projectCheck && !isValidProject) {
      setShowProjectDialog(true);
    }
  };

  // New function to run backend container
  const handleRunBackend = async () => {
    if (!selectedBackendRepo)
      return alert("Please select a backend repository.");

    // Check backend status first if not already checked
    let currentBackendStatus = backendStatus[selectedBackendRepo];
    if (!currentBackendStatus) {
      currentBackendStatus = await checkBackendProject(selectedBackendRepo);
    }

    if (!currentBackendStatus?.is_backend) {
      alert(
        `This repository (${selectedBackendRepo}) is not a backend project and cannot be run.`
      );
      return;
    }

    // Check if already running
    const isRunning = runningBackends.find(
      (backend) => backend.repo === selectedBackendRepo
    );
    if (isRunning) {
      alert(
        `Backend ${selectedBackendRepo} is already running at ${isRunning.local_url}`
      );
      return;
    }

    setIsLoading(true);
    setBackendOperationStatus("⏳ Starting backend container...");

    if (isServerDown) {
      // Simulate backend start with mock data
      setTimeout(() => {
        const mockPort = 3000 + Math.floor(Math.random() * 1000);
        const newBackend = {
          owner: MOCK_DATA.user.login,
          repo: selectedBackendRepo,
          container_id: `demo_container_${Date.now()}`,
          local_url: `http://localhost:${mockPort}`,
          port: mockPort,
          backend_type: currentBackendStatus.backend_type,
          status: "running",
          uptime: 0,
        };

        setRunningBackends([...runningBackends, newBackend]);
        setBackendOperationStatus(
          `✅ Backend ${selectedBackendRepo} is now running at ${newBackend.local_url}`
        );
        setIsLoading(false);
      }, 3000);
      return;
    }

    const selectedRepoObj = repos.find(
      (repo) => repo.name === selectedBackendRepo
    );
    if (!selectedRepoObj) {
      setBackendOperationStatus("❌ Repository not found");
      setIsLoading(false);
      return;
    }

    axios
      .post(
        `${API}/project/run-backend/${selectedRepoObj.owner}/${selectedRepoObj.name}`,
        {},
        { withCredentials: true }
      )
      .then((res) => {
        setBackendOperationStatus(
          `✅ Backend ${selectedBackendRepo} is now running at ${res.data.local_url}`
        );
        fetchRunningBackends(); // Refresh running backends list
        setIsLoading(false);
      })
      .catch((err) => {
        setBackendOperationStatus(
          `❌ Failed to start backend: ${
            err.response?.data?.error || "Unknown error"
          }`
        );
        console.error(err);
        setIsLoading(false);
      });
  };

  // New function to stop backend container
  const handleStopBackend = (owner, repo) => {
    if (window.confirm(`Are you sure you want to stop the backend ${repo}?`)) {
      setIsLoading(true);

      if (isServerDown) {
        setTimeout(() => {
          setRunningBackends(runningBackends.filter((b) => b.repo !== repo));
          setIsLoading(false);
        }, 1000);
        return;
      }

      axios
        .delete(`${API}/project/stop-backend/${owner}/${repo}`, {
          withCredentials: true,
        })
        .then(() => {
          fetchRunningBackends();
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to stop backend", err);
          setIsLoading(false);
        });
    }
  };

  // New function to get backend logs
  const handleGetLogs = async (owner, repo) => {
    if (isServerDown) {
      // Mock logs for demo
      const mockLogs = [
        "🚀 Starting backend container...",
        "📦 Installing dependencies...",
        "✅ Dependencies installed successfully",
        "🌟 Server started on port 3001",
        "📡 API endpoints available:",
        "  GET /api/health",
        "  GET /api/status",
        "🔄 Waiting for requests...",
      ];
      setContainerLogs({ [repo]: mockLogs });
      setSelectedLogsRepo(repo);
      setShowLogsModal(true);
      return;
    }

    try {
      const response = await axios.get(
        `${API}/project/backend-logs/${owner}/${repo}`,
        { withCredentials: true }
      );

      setContainerLogs({ [repo]: response.data.logs || [] });
      setSelectedLogsRepo(repo);
      setShowLogsModal(true);
    } catch (error) {
      console.error("Failed to get logs", error);
      alert("Failed to retrieve container logs");
    }
  };

  const handleLogin = async () => {
    try {
      console.log("Redirecting to GitHub OAuth...");
      // Redirect to the login endpoint instead of making an axios request
      window.location.href = `${API}/user/login`;
    } catch (error) {
      console.error("Login redirect failed", error);
    }
  };

  const handleLogout = () => {
    if (isServerDown) {
      setuser(null);
      setRepos([]);
      setSelectedRepo("");
      setSelectedBackendRepo("");
      setBuilds([]);
      setDeployedProjects([]);
      setRunningBackends([]);
      setReactStatus({});
      setBackendStatus({});
      return;
    }

    axios
      .post(`${API}/user/logout`, {}, { withCredentials: true })
      .then(() => {
        setuser(null);
        setRepos([]);
        setSelectedRepo("");
        setSelectedBackendRepo("");
        setBuilds([]);
        setDeployedProjects([]);
        setRunningBackends([]);
        setReactStatus({});
        setBackendStatus({});
      })
      .catch((err) => console.error(err));
  };

  const handleBuild = async () => {
    if (!selectedRepo) return alert("Please select a repo.");

    // Check React status first if not already checked
    let currentReactStatus = reactStatus[selectedRepo];
    if (!currentReactStatus) {
      currentReactStatus = await checkReactProject(selectedRepo);
    }

    if (!currentReactStatus?.is_react) {
      alert(
        `This repository (${selectedRepo}) is not a React project and cannot be built.`
      );
      return;
    }

    setIsLoading(true);
    setBuildStatus("⏳ Building...");

    if (isServerDown) {
      // Simulate build success with mock data
      setTimeout(() => {
        setBuildStatus(
          `✅ Built: ${selectedRepo} successfully! Project deployed to S3.`
        );
        setIsLoading(false);

        // Add the newly "built" project to the list
        const newBuild = {
          id: `${MOCK_DATA.user.login}_${selectedRepo.replace(
            /[^a-zA-Z0-9]/g,
            "-"
          )}`,
          name: `${MOCK_DATA.user.login}/${selectedRepo}`,
          path: `./builds/${MOCK_DATA.user.login}_${selectedRepo.replace(
            /[^a-zA-Z0-9]/g,
            "-"
          )}`,
          file_count: Math.floor(Math.random() * 50) + 10,
          has_index: true,
          files: ["index.html", "static", "asset-manifest.json"],
          s3_url: `https://demo-bucket.s3-website-us-east-1.amazonaws.com/${selectedRepo}`,
        };

        setBuilds([...builds, newBuild]);
      }, 3000);
      return;
    }

    const selectedRepoObj = repos.find((repo) => repo.name === selectedRepo);
    if (!selectedRepoObj) {
      setBuildStatus("❌ Repository not found");
      setIsLoading(false);
      return;
    }

    axios
      .post(
        `${API}/project/build/${selectedRepoObj.owner}/${selectedRepoObj.name}`,
        {},
        { withCredentials: true }
      )
      .then((res) => {
        setBuildStatus(
          `✅ Built: ${res.data.message || "Success"} ${
            res.data.s3_url ? `- Deployed to: ${res.data.s3_url}` : ""
          }`
        );
        fetchBuilds(); // Refresh builds list
        fetchDeployedProjects(); // Refresh deployed projects list
        setIsLoading(false);
      })
      .catch((err) => {
        setBuildStatus(
          `❌ Build failed: ${err.response?.data?.error || "Unknown error"}`
        );
        console.error(err);
        setIsLoading(false);
      });
  };

  const handleDeleteBuild = (buildId) => {
    if (window.confirm("Are you sure you want to delete this build?")) {
      setIsLoading(true);

      if (isServerDown) {
        setTimeout(() => {
          setBuilds(builds.filter((b) => b.id !== buildId));
          setIsLoading(false);
        }, 1000);
        return;
      }

      axios
        .delete(`${API}/project/builds/${buildId}`, {
          withCredentials: true,
        })
        .then(() => {
          fetchBuilds();
        })
        .catch((err) => {
          console.error("Failed to delete build", err);
          setIsLoading(false);
        });
    }
  };

  const handleRebuild = (buildId) => {
    setIsLoading(true);

    if (isServerDown) {
      setTimeout(() => {
        setBuilds(
          builds.map((b) =>
            b.id === buildId
              ? { ...b, file_count: Math.floor(Math.random() * 50) + 10 }
              : b
          )
        );
        setIsLoading(false);
      }, 1500);
      return;
    }

    // Extract owner and repo from build ID (format: owner_repo)
    const [owner, ...repoParts] = buildId.split("_");
    const repo = repoParts.join("_");

    axios
      .post(
        `${API}/project/build/${owner}/${repo}`,
        {},
        { withCredentials: true }
      )
      .then(() => {
        fetchBuilds();
        fetchDeployedProjects();
      })
      .catch((err) => {
        console.error("Failed to rebuild project", err);
        setIsLoading(false);
      });
  };

  const filteredBuilds = builds.filter(
    (build) =>
      build.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      build.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDeployedProjects = deployedProjects.filter(
    (project) =>
      project.project_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.repo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRunningBackends = runningBackends.filter(
    (backend) =>
      backend.repo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backend.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getRepoDisplayInfo = (repo) => {
    const reactStat = reactStatus[repo.name];
    const backendStat = backendStatus[repo.name];

    if (reactStat?.is_react && backendStat?.is_backend) {
      return {
        icon: "🔀",
        label: "Full-stack",
        color: "text-purple-400",
      };
    } else if (reactStat?.is_react) {
      return {
        icon: "⚛️",
        label: reactStat.project_path
          ? `React (${reactStat.project_path})`
          : "React (root)",
        color: "text-green-400",
      };
    } else if (backendStat?.is_backend) {
      return {
        icon: backendStat.backend_type === "nodejs" ? "🟢" : "🐍",
        label: `${
          backendStat.details?.framework || backendStat.backend_type
        } API`,
        color: "text-blue-400",
      };
    } else if (
      reactStat?.is_react === false &&
      backendStat?.is_backend === false
    ) {
      return {
        icon: "📄",
        label: repo.language || "Unknown",
        color: "text-gray-400",
      };
    }
    return {
      icon: "❓",
      label: repo.language || "Unknown",
      color: "text-gray-400",
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 font-mono">
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg border-b border-gray-700">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold">Hoster</h1>
            {isServerDown && (
              <span className="text-amber-400 text-sm font-medium">
                (Demo Mode)
              </span>
            )}
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center">
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-gray-600"
                />
                <span className="ml-2 font-medium">
                  {user.name || user.login}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 border border-gray-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {isServerDown && (
          <div className="mb-8 bg-gray-800 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0"></div>
              <div className="ml-3">
                <p className="text-sm text-amber-300">
                  Server is currently offline. Using mock data for demonstration
                  purposes. Repository detection, builds, and backend containers
                  are simulated.
                </p>
              </div>
            </div>
          </div>
        )}

        {!user ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-md max-w-md w-full text-center">
              <h2 className="mt-6 text-2xl font-bold text-white">
                Welcome to Hoster
              </h2>
              <p className="mt-2 text-gray-300">
                Deploy React apps and run backend containers locally with
                intelligent project detection
              </p>
              <button
                onClick={handleLogin}
                className="mt-8 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800"
              >
                Login with GitHub
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* React Build Section */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="p-6 md:p-8 w-full">
                  <h2 className="text-xl font-semibold text-white mb-6">
                    Build React Project
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="repo-select"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Select React Repository
                      </label>
                      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                        <select
                          id="repo-select"
                          onChange={(e) =>
                            handleRepoSelection(e.target.value, "react")
                          }
                          value={selectedRepo}
                          className="flex-grow block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">-- Choose a repository --</option>
                          {repos.map((repo) => {
                            const displayInfo = getRepoDisplayInfo(repo);
                            return (
                              <option
                                key={
                                  repo.full_name || `${repo.owner}-${repo.name}`
                                }
                                value={repo.name}
                              >
                                {repo.full_name} {displayInfo.icon} (
                                {displayInfo.label})
                              </option>
                            );
                          })}
                        </select>
                        <button
                          onClick={handleBuild}
                          disabled={
                            isLoading || !selectedRepo || checkingProject
                          }
                          className={`flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            isLoading || !selectedRepo || checkingProject
                              ? "bg-indigo-400 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          }`}
                        >
                          {isLoading
                            ? "Building..."
                            : checkingProject
                            ? "Checking..."
                            : "Build & Deploy"}
                        </button>
                      </div>
                    </div>

                    {/* React Status Display */}
                    {selectedRepo && reactStatus[selectedRepo] && (
                      <div
                        className={`p-3 rounded-md border ${
                          reactStatus[selectedRepo].is_react
                            ? "bg-green-900 text-green-300 border-green-700"
                            : "bg-yellow-900 text-yellow-300 border-yellow-700"
                        }`}
                      >
                        {reactStatus[selectedRepo].is_react ? (
                          <div>
                            ✅ React project detected
                            {reactStatus[selectedRepo].project_path &&
                              ` in folder: ${reactStatus[selectedRepo].project_path}`}
                            {reactStatus[selectedRepo].details && (
                              <div className="text-sm mt-1">
                                Type:{" "}
                                {reactStatus[selectedRepo].details.project_type}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            ⚠️ This repository is not a React project and cannot
                            be built
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {buildStatus && (
                    <div
                      className={`mt-6 p-3 rounded-md ${
                        buildStatus.includes("✅")
                          ? "bg-green-900 text-green-300 border border-green-700"
                          : buildStatus.includes("❌")
                          ? "bg-red-900 text-red-300 border border-red-700"
                          : "bg-blue-900 text-blue-300 border border-blue-700"
                      }`}
                    >
                      {buildStatus}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Backend Container Section */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="p-6 md:p-8 w-full">
                  <h2 className="text-xl font-semibold text-white mb-6">
                    Run Backend Container
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="backend-repo-select"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Select Backend Repository
                      </label>
                      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                        <select
                          id="backend-repo-select"
                          onChange={(e) =>
                            handleRepoSelection(e.target.value, "backend")
                          }
                          value={selectedBackendRepo}
                          className="flex-grow block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">
                            -- Choose a backend repository --
                          </option>
                          {repos.map((repo) => {
                            const displayInfo = getRepoDisplayInfo(repo);
                            return (
                              <option
                                key={
                                  repo.full_name || `${repo.owner}-${repo.name}`
                                }
                                value={repo.name}
                              >
                                {repo.full_name} {displayInfo.icon} (
                                {displayInfo.label})
                              </option>
                            );
                          })}
                        </select>
                        <button
                          onClick={handleRunBackend}
                          disabled={
                            isLoading || !selectedBackendRepo || checkingProject
                          }
                          className={`flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            isLoading || !selectedBackendRepo || checkingProject
                              ? "bg-green-400 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {isLoading
                            ? "Starting..."
                            : checkingProject
                            ? "Checking..."
                            : "Run Container"}
                        </button>
                      </div>
                    </div>

                    {/* Backend Status Display */}
                    {selectedBackendRepo &&
                      backendStatus[selectedBackendRepo] && (
                        <div
                          className={`p-3 rounded-md border ${
                            backendStatus[selectedBackendRepo].is_backend
                              ? "bg-green-900 text-green-300 border-green-700"
                              : "bg-yellow-900 text-yellow-300 border-yellow-700"
                          }`}
                        >
                          {backendStatus[selectedBackendRepo].is_backend ? (
                            <div>
                              ✅ Backend project detected (
                              {backendStatus[selectedBackendRepo].backend_type})
                              {backendStatus[selectedBackendRepo]
                                .project_path &&
                                ` in folder: ${backendStatus[selectedBackendRepo].project_path}`}
                              {backendStatus[selectedBackendRepo].details && (
                                <div className="text-sm mt-1">
                                  Framework:{" "}
                                  {
                                    backendStatus[selectedBackendRepo].details
                                      .framework
                                  }
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              ⚠️ This repository is not a backend project and
                              cannot be run
                            </div>
                          )}
                        </div>
                      )}
                  </div>

                  {backendOperationStatus && (
                    <div
                      className={`mt-6 p-3 rounded-md ${
                        backendOperationStatus.includes("✅")
                          ? "bg-green-900 text-green-300 border border-green-700"
                          : backendOperationStatus.includes("❌")
                          ? "bg-red-900 text-red-300 border border-red-700"
                          : "bg-blue-900 text-blue-300 border border-blue-700"
                      }`}
                    >
                      {backendOperationStatus}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-md overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Projects & Containers
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
                        className="block w-full rounded-md py-1 bg-gray-700 border-gray-600 text-white pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder-gray-400"
                        placeholder="Search projects..."
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-700 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab("builds")}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "builds"
                          ? "border-indigo-500 text-indigo-400"
                          : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                      }`}
                    >
                      Built Projects ({filteredBuilds.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("deployed")}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "deployed"
                          ? "border-indigo-500 text-indigo-400"
                          : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                      }`}
                    >
                      Deployed Projects ({filteredDeployedProjects.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("backends")}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "backends"
                          ? "border-indigo-500 text-indigo-400"
                          : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                      }`}
                    >
                      Running Backends ({filteredRunningBackends.length})
                    </button>
                  </nav>
                </div>

                {/* Built Projects Tab */}
                {activeTab === "builds" && (
                  <div className="space-y-4">
                    {filteredBuilds.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium">
                          No built projects
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by building a React project.
                        </p>
                      </div>
                    ) : (
                      filteredBuilds.map((build) => (
                        <div
                          key={build.id}
                          className="bg-gray-700 border border-gray-600 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-white">
                                {build.name}
                              </h3>
                              <div className="mt-1 flex items-center text-sm text-gray-400">
                                <span>📁 {build.file_count} files</span>
                                {build.has_index && (
                                  <span className="ml-4">
                                    ✅ Has index.html
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 text-sm text-gray-300">
                                Path: {build.path}
                              </p>
                              {build.s3_url && (
                                <div className="mt-2">
                                  <a
                                    href={build.s3_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-indigo-300 bg-indigo-900 hover:bg-indigo-800"
                                  >
                                    🌐 View Live
                                  </a>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleRebuild(build.id)}
                                disabled={isLoading}
                                className="px-3 py-1 text-xs font-medium text-green-300 bg-green-900 border border-green-700 rounded hover:bg-green-800 disabled:opacity-50"
                              >
                                🔄 Rebuild
                              </button>
                              <button
                                onClick={() => handleDeleteBuild(build.id)}
                                disabled={isLoading}
                                className="px-3 py-1 text-xs font-medium text-red-300 bg-red-900 border border-red-700 rounded hover:bg-red-800 disabled:opacity-50"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Deployed Projects Tab */}
                {activeTab === "deployed" && (
                  <div className="space-y-4">
                    {filteredDeployedProjects.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium">
                          No deployed projects
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Deploy a project to see it here.
                        </p>
                      </div>
                    ) : (
                      filteredDeployedProjects.map((project, index) => (
                        <div
                          key={index}
                          className="bg-gray-700 border border-gray-600 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-white">
                                {project.project_path}
                              </h3>
                              <div className="mt-1 flex items-center text-sm text-gray-400">
                                <span>{project.status}</span>
                                <span className="ml-4">
                                  📁 {project.file_count} files
                                </span>
                                {project.has_index && (
                                  <span className="ml-4">
                                    ✅ Has index.html
                                  </span>
                                )}
                                {project.has_static && (
                                  <span className="ml-4">
                                    📦 Has static assets
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 space-x-4">
                                {project.website_url && (
                                  <a
                                    href={project.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-indigo-300 bg-indigo-900 hover:bg-indigo-800"
                                  >
                                    🌐 Website
                                  </a>
                                )}
                                {project.direct_url && (
                                  <a
                                    href={project.direct_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-gray-300 bg-gray-600 hover:bg-gray-500"
                                  >
                                    📂 Direct Access
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Running Backends Tab */}
                {activeTab === "backends" && (
                  <div className="space-y-4">
                    {filteredRunningBackends.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium">
                          No running backends
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Start a backend container to see it here.
                        </p>
                      </div>
                    ) : (
                      filteredRunningBackends.map((backend, index) => (
                        <div
                          key={index}
                          className="bg-gray-700 border border-gray-600 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-white">
                                {backend.owner}/{backend.repo}
                              </h3>
                              <div className="mt-1 flex items-center text-sm text-gray-400">
                                <span className="flex items-center">
                                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                  {backend.status}
                                </span>
                                <span className="ml-4">
                                  {backend.backend_type === "nodejs"
                                    ? "🟢"
                                    : "🐍"}
                                  {backend.backend_type}
                                </span>
                                <span className="ml-4">
                                  ⏱️ {formatUptime(backend.uptime)}
                                </span>
                              </div>
                              <div className="mt-2">
                                <a
                                  href={backend.local_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-green-300 bg-green-900 hover:bg-green-800"
                                >
                                  🌐 {backend.local_url}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  handleGetLogs(backend.owner, backend.repo)
                                }
                                className="px-3 py-1 text-xs font-medium text-blue-300 bg-blue-900 border border-blue-700 rounded hover:bg-blue-800"
                              >
                                📄 Logs
                              </button>
                              <button
                                onClick={() =>
                                  handleStopBackend(backend.owner, backend.repo)
                                }
                                disabled={isLoading}
                                className="px-3 py-1 text-xs font-medium text-red-300 bg-red-900 border border-red-700 rounded hover:bg-red-800 disabled:opacity-50"
                              >
                                ⏹️ Stop
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Project Detection Dialog */}
      {showProjectDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800 border-gray-700">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-white">
                Project Type Detected
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-300">
                  The selected repository ({selectedRepoForCheck}) doesn't
                  appear to be the expected project type.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => {
                    setShowProjectDialog(false);
                    setSelectedRepoForCheck(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && selectedLogsRepo && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-3/4 max-w-4xl shadow-lg rounded-md bg-gray-800 border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">
                Container Logs - {selectedLogsRepo}
              </h3>
              <button
                onClick={() => {
                  setShowLogsModal(false);
                  setSelectedLogsRepo(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-900 rounded-md p-4 h-96 overflow-y-auto">
              <pre className="text-sm text-green-400 font-mono">
                {containerLogs[selectedLogsRepo]?.join("\n") ||
                  "No logs available"}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
