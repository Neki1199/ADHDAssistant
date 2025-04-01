import React, { createContext, useState, useEffect, useRef } from "react";
import { auth } from "../../firebaseConfig";
import { getTasks } from "./TasksDB";
import dayjs from "dayjs";

export const TasksContext = createContext();

export const sortTasks = (tasks) => {
    return tasks.sort((a, b) => {
        // create date time, if time exists append T to create time object (ISO format) / handle no dates with a further date
        const aDate = a.date ? dayjs(`${a.date}${a.time ? `T${a.time}` : ""}`) : dayjs("9999-12-31");
        const bDate = b.date ? dayjs(`${b.date}${b.time ? `T${b.time}` : ""}`) : dayjs("9999-12-31");

        // if a and b are the same date
        if (aDate.isSame(bDate, "day")) {
            if (!a.time) return 1; // if no time, a after b
            if (!b.time) return -1; // if no time, b after a
            return aDate.isBefore(bDate) ? -1 : 1; // if both have time compare complete dates
        }
        // if dates not the same compare directly (-1 a before b, 1 a after b)
        return aDate.isBefore(bDate) ? -1 : 1;
    })
};

export const TasksProvider = ({ children }) => {
    const [allTasks, setAllTasks] = useState({});
    const [listsNums, setListsNums] = useState({});

    const unsubscribe = useRef(null);

    useEffect(() => {
        // make sure to stop listening when log out
        const authChange = (user) => {
            if (unsubscribe.current) {
                unsubscribe.current();
                unsubscribe.current = null;
            }
            // when log out, clear
            if (!user) {
                setAllTasks({}); // clear when logout
            }
        };

        const listenAuth = auth.onAuthStateChanged(authChange);

        return () => {
            listenAuth();
            if (unsubscribe.current && typeof unsubscribe === "function") { unsubscribe.current(); }
        };
    }, []);

    const getTasksList = (listID, setTasks) => {
        const unsubscribe = getTasks(listID, (newTasks) => {
            // order tasks by past, current, and upcoming
            const sortedTasks = sortTasks(newTasks);
            setTasks(sortedTasks);
            setAllTasks((prev) => ({
                ...prev,
                [listID]: sortedTasks,
            }), // update only this list
            );
        });
        return () => { if (unsubscribe && typeof unsubscribe === "function") { unsubscribe(); } }
    };

    return (
        <TasksContext.Provider value={{ allTasks, setAllTasks, getTasksList, listsNums, setListsNums }}>
            {children}
        </TasksContext.Provider>
    );
};