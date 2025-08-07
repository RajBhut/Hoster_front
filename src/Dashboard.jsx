import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

const data = [
  {
    username: "user1",
    name: "Project A",
    status: "Deployed",
    url: "https://project-a.example.com",
    states: 1,
    id: 1,
  },
  {
    username: "user2",
    name: "Project B",
    status: "Pending",
    url: "",
    states: 1,
    id: 2,
  },
  {
    username: "user3",
    name: "Project C",
    status: "Failed",
    url: "",
    states: 1,
    id: 3,
  },
];

const ITEMS_PER_PAGE = 5;
const STATUS_OPTIONS = ["All", "Deployed", "Pending", "Failed"];

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All"); 

  const sortedAndFilteredData = useMemo(() => {
    let filteredData = [...data];

    // Apply status filter
    if (statusFilter !== "All") {
      filteredData = filteredData.filter(
        (project) => project.status === statusFilter
      );
    }

    // Apply search term filter
    if (searchTerm) {
      filteredData = filteredData.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.status.toLowerCase().includes(searchTerm.toLowerCase()) // Keep this for broader search within filtered status
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredData;
  }, [searchTerm, sortConfig, statusFilter]); // Add statusFilter to dependencies

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedAndFilteredData, currentPage]);

  const totalPages = Math.ceil(sortedAndFilteredData.length / ITEMS_PER_PAGE);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); 
  };

  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === "ascending" ? " \u2191" : " \u2193";
    }
    return null;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page on filter change
  };

  return (
    <div className="min-h-screen p-4 font-mono text-gray-300 bg-gray-900 md:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Project Status Dashboard
        </h1>
      </header>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search projects..."
          className="w-full p-3 text-white placeholder-gray-400 transition-all duration-300 ease-in-out bg-gray-700 border-gray-600 rounded-lg shadow-sm md:w-1/3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 focus:shadow-lg"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <div className="flex items-center justify-center space-x-2 md:justify-end">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilterChange(status)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out hover:shadow-md hover:scale-105 ${
                statusFilter === status
                  ? "bg-indigo-600 text-white shadow-lg scale-105"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 shadow-2xl rounded-xl">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th
                className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-300 uppercase transition-colors duration-200 ease-in-out cursor-pointer hover:bg-gray-600"
                onClick={() => requestSort("username")}
              >
                Username <SortIndicator columnKey="username" />
              </th>
              <th
                className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-300 uppercase transition-colors duration-200 ease-in-out cursor-pointer hover:bg-gray-600"
                onClick={() => requestSort("name")}
              >
                Name <SortIndicator columnKey="name" />
              </th>
              <th
                className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-300 uppercase transition-colors duration-200 ease-in-out cursor-pointer hover:bg-gray-600"
                onClick={() => requestSort("status")}
              >
                Status <SortIndicator columnKey="status" />
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-300 uppercase">
                URL
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-300 uppercase">
                States
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((project) => (
                <tr
                  key={project.id}
                  className="transition-all duration-300 ease-in-out hover:bg-gray-700 hover:shadow-md hover:scale-[1.01]"
                >
                  <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                    {project.username}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                    {project.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold leading-tight ${
                        project.status === "Deployed"
                          ? "bg-green-900 text-green-300 border border-green-700"
                          : project.status === "Pending"
                          ? "bg-yellow-900 text-yellow-300 border border-yellow-700"
                          : "bg-red-900 text-red-300 border border-red-700"
                      }`}
                    >
                      {project.status === "Deployed" && (
                        <svg
                          className="w-2.5 h-2.5 mr-1.5 text-green-400"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          {" "}
                          <circle cx="4" cy="4" r="3" />{" "}
                        </svg>
                      )}
                      {project.status === "Pending" && (
                        <svg
                          className="w-2.5 h-2.5 mr-1.5 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          {" "}
                          <circle cx="4" cy="4" r="3" />{" "}
                        </svg>
                      )}
                      {project.status === "Failed" && (
                        <svg
                          className="w-2.5 h-2.5 mr-1.5 text-red-400"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          {" "}
                          <circle cx="4" cy="4" r="3" />{" "}
                        </svg>
                      )}
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-indigo-400 transition-colors hover:text-indigo-300 hover:underline"
                      >
                        Visit Site
                      </a>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">
                    <Link to={`/state/${project.id}`}>
                      <button className="px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-in-out bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-500 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800">
                        Analyse
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-300 ease-in-out bg-gray-700 border border-gray-600 rounded-md shadow-sm hover:bg-gray-600 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 text-sm font-medium border rounded-md shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:scale-105 ${
                currentPage === page
                  ? "bg-indigo-600 text-white border-indigo-500 scale-105 shadow-lg"
                  : "text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-300 ease-in-out bg-gray-700 border border-gray-600 rounded-md shadow-sm hover:bg-gray-600 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
