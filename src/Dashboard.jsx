import React from "react";
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

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Project Status</h1>
      <table className="min-w-full border border-gray-300 table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Username</th>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">URL</th>
            <th className="px-4 py-2 border">States</th>
          </tr>
        </thead>
        <tbody>
          {data.map((project) => (
            <tr key={project.id} className="text-center">
              <td className="px-4 py-2 border">{project.username}</td>
              <td className="px-4 py-2 border">{project.name}</td>
              <td className="px-4 py-2 border">{project.status}</td>
              <td className="px-4 py-2 border">
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Visit
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-2 border">
                <Link to={`/state/${project.id}`}>
                  <button className="px-3 py-1 font-semibold text-white bg-green-500 rounded hover:bg-green-600">
                    Analyse
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
