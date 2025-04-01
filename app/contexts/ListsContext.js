import React, { createContext, useState, useEffect, useRef } from "react";
import { getAllLists } from "./TasksDB";
import { auth } from "../../firebaseConfig";

export const ListsContext = createContext();

export const ListsProvider = ({ children }) => {
    const [allLists, setAllLists] = useState([]);
    const unsubscribe = useRef(null);

    useEffect(() => {
        // make sure to stop listening when log out (errors)
        const authChange = (user) => {
            if (unsubscribe.current) {
                unsubscribe.current();
                unsubscribe.current = null;
            }
            // when log out, clear
            if (user) {
                unsubscribe.current = getAllLists(setAllLists)
            } else {
                setAllLists([]);
            }
        };

        const listenAuth = auth.onAuthStateChanged(authChange);

        return () => {
            listenAuth();
            if (unsubscribe.current && typeof unsubscribe === "function") { unsubscribe.current(); }
        };
    }, []);

    return (
        <ListsContext.Provider value={{ allLists, setAllLists }}>
            {children}
        </ListsContext.Provider>
    );
};