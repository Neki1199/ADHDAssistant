import React, { createContext, useState, useEffect, useRef } from "react";
import { getAllLists } from "../screens/Tasks/TasksDB";
import { auth } from "../../firebaseConfig";

export const ListsContext = createContext();

export const ListsProvider = ({ children }) => {
    const [allLists, setAllLists] = useState([]);
    const unsuscribe = useRef(null);

    useEffect(() => {
        // make sure to stop listening when log out (errors)
        const authChange = (user) => {
            if (unsuscribe.current) {
                unsuscribe.current();
                unsuscribe.current = null;
            }
            // when log out, clear
            if (user) {
                unsuscribe.current = getAllLists(setAllLists)
            } else {
                setAllLists([]); // clear when logout
            }
        };

        const listenAuth = auth.onAuthStateChanged(authChange);

        return () => {
            listenAuth();
            if (unsuscribe.current && typeof unsuscribe === "function") { unsuscribe.current(); }
        };
    }, []);

    return (
        <ListsContext.Provider value={{ allLists, setAllLists }}>
            {children}
        </ListsContext.Provider>
    );
};