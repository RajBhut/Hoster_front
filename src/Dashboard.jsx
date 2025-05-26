import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

const data = [
  {
    username: "user1",
    name: "Project A",
    status: "Deployed",
    url: "https://project-a.example.com",
    id: 1

  },
  {
    username: "user2",
    name: "Project B",
    status: "Pending",
    url: "",
    id: 2
  },
  {
    username: "user3",
    name: "Project C",
    status: "Failed",
    url: "",
    id: 3
  },
];

const ITEMS_PER_PAGE = 5; // Or any number you prefer

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);

  const sortedAndFilteredData = useMemo(() => {
    let filteredData = [...data]; // Create a new array to avoid mutating the original
    if (searchTerm) {
      filteredData = filteredData.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredData;
  }, [searchTerm, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedAndFilteredData, currentPage]);

  const totalPages = Math.ceil(sortedAndFilteredData.length / ITEMS_PER_PAGE);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page on sort
  };

  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'ascending' ? ' \u2191' : ' \u2193'; // Up and Down arrows
    }
    return null;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-100">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Project Status Dashboard</h1>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search projects (name, user, status)..."
          className="w-full sm:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
        />
        {/* Future: Add more filters or actions here if needed */}
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('username')}>
                Username <SortIndicator columnKey="username" />
              </th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('name')}>
                Name <SortIndicator columnKey="name" />
              </th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('status')}>
                Status <SortIndicator columnKey="status" />
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">URL</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">States</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{project.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{project.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold leading-tight ${
                        project.status === "Deployed"
                          ? "bg-green-100 text-green-700"
                          : project.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {project.status === "Deployed" && (
                        <svg className="w-2.5 h-2.5 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 8 8"> <circle cx="4" cy="4" r="3" /> </svg>
                      )}
                      {project.status === "Pending" && (
                        <svg className="w-2.5 h-2.5 mr-1.5 text-yellow-500" fill="currentColor" viewBox="0 0 8 8"> <circle cx="4" cy="4" r="3" /> </svg>
                      )}
                      {project.status === "Failed" && (
                        <svg className="w-2.5 h-2.5 mr-1.5 text-red-500" fill="currentColor" viewBox="0 0 8 8"> <circle cx="4" cy="4" r="3" /> </svg>
                      )}
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium transition-colors"
                      >
                        Visit Site
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">
                    <Link to={`/state/${project.id}`}>
                      <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all">
                        Analyse
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 text-sm font-medium border rounded-md shadow-sm transition-colors ${
                currentPage === page
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
