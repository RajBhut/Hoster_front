import React, { createContext, useState } from "react";

export const Usercontex = createContext();

export default function UserProvider({ children }) {
  const [user, setuser] = useState(null);

  return (
    <Usercontex.Provider value={{ user, setuser }}>
      {children}
    </Usercontex.Provider>
  );
}
