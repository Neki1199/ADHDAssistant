import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native-web';
import { db, auth } from "../../../firebaseConfig"
import { doc, updateDoc, getDocs, collection, query, where, arrayUnion, onSnapshot, getDoc, setDoc, arrayRemove, deleteDoc } from '@firebase/firestore';


export const addTask = async (name, dateTime, reminder, repeat, duration, completed, list, isPast) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    const taskData = { name, dateTime, reminder, repeat, duration, completed, list, isPast };
    try {
        const listRef = doc(db, "users", userID, "todoLists", list);
        const listDoc = await getDoc(listRef);

        if (listDoc.exists()) {
            await updateDoc(listRef,
                { Tasks: arrayUnion(taskData) });
        }
    } catch (error) {
        Alert.alert(
            "⚠️ Ups!",
            "Error adding new task",
            [{ text: "Try Again", style: "default" }]
        );
    }
};

export const changeTask = async (task, newData) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    const listRef = doc(db, "users", userID, "todoLists", task.list);
    try {
        await updateDoc(listRef, {
            Tasks: arrayRemove(task)
        });
        await updateDoc(listRef, {
            Tasks: arrayUnion({ ...task, ...newData })
        });
    } catch (error) {
        Alert.alert(
            "⚠️ Ups!",
            "Error updating task",
            [{ text: "Try Again", style: "default" }]
        );
    }
};

export const deleteTask = async (task) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    const listRef = doc(db, "users", userID, "todoLists", task.list);
    try {
        await updateDoc(listRef, {
            Tasks: arrayRemove(task)
        });
    } catch (error) {
        Alert.alert(
            "⚠️ Ups!",
            "Error deleting task",
            [{ text: "Try Again", style: "default" }]
        );
    }

};

// to check if the task is past its due date
export const setIsPast = (task) => {
    const currentDate = new Date();
    const taskDate = new Date(task.dateTime);

    if (taskDate < currentDate) {
        return { ...task, isPast: true };
    }
    return task;
};

// to move task to the completed or past collection
export const changeToCompletedList = async (task) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    const taskList = task.list;
    const tasksRef = collection(db, "users", userID, "todoLists", taskList, "Tasks");
    const completedRef = collection(db, "users", userID, "otherToDo", "allCompletedTasks");
    const pastRef = collection(db, "users", userID, "otherToDo", "pastTasks");

    try {
        // set to all completed tasks
        if (task.isPast && task.completed) {
            await setDoc(doc(completedRef, task.id), task);
            await deleteTask(task);
        } else if (task.isPast && !task.completed) {
            // set to pastTasks
            await setDoc(doc(pastRef, task.id), task);
            await deleteTask(task);
        }
    } catch (error) {
        console.log("Error moving to completed or past: ", error);
    }
};

export const setCompleted = async (task) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    const listRef = doc(db, "users", userID, "todoLits", task.list);
    // add +1 to

    try {
        await updateDoc(listRef, {
            Tasks: arrayRemove(task)
        });
        await updateDoc(listRef, {
            Tasks: arrayUnion({ ...task, completed: true }) // change to completed true
        });
    } catch (error) {
        console.log("Error marking completed task: ", error);
    }
};

export const setNotCompleted = async (task) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    const listRef = doc(db, "users", userID, "todoLits", task.list);

    try {
        await updateDoc(listRef, {
            Tasks: arrayRemove(task)
        });
        await updateDoc(listRef, {
            Tasks: arrayUnion({ ...task, completed: false })
        });
        // -1 to the list on progress, and total
    } catch (error) {
        console.log("Error to set to not completed task: ", error);
    }
};

// add +1 to the counters
export const addCompletedCount = async (task) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;
    const progressListRef = doc(db, "users", userID, "otherToDo", "progress", task.list);
    const progressaTotalRef = doc(db, "users", userID, "otherToDo", "progress", "Total");

    try {
        await updateDoc(progressListRef, {
            //the list name is a field with a counter,
            // add +1 to that count
        });
        await updateDoc(progressaTotalRef, {
            // add +1 to Total
        });
    } catch (error) {
        console.log("Error to set to not completed task: ", error);
    }
};

export const addNewList = async (listID) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    try {
        const listRef = doc(db, "users", userID, "todoLists", listID);
        const listDoc = await getDoc(listRef);

        if (listDoc.exists()) {
            Alert.alert(
                "⚠️ Ups!",
                "This list already exists",
                [{ text: "Try Again", style: "default" }]
            );
        } else {
            await setDoc(listRef, { Tasks: [], completedTasks: [] });
        }
    } catch (error) {
        Alert.alert(
            "⚠️ Ups!",
            "Error adding new list",
            [{ text: "Try Again", style: "default" }]
        );
    }
};

export const changeList = async (listID, newName) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    const listRef = doc(db, "users", userID, "todoLists", listID);

    try {
        // change the ID to newName
        await updateDoc(listRef, { uid: newName })
    } catch (error) {
        Alert.alert(
            "⚠️ Ups!",
            "Error renaming list",
            [{ text: "Try Again", style: "default" }]
        );
    }
};

export const deleteList = async (listID) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    const listRef = doc(db, "users", userID, "todoLists", listID);

    try {
        await deleteDoc(listRef)
    } catch (error) {
        Alert.alert(
            "⚠️ Ups!",
            "Error removing list",
            [{ text: "Try Again", style: "default" }]
        );
    }
};

export const getTasks = async (listID, setTasks) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return [];

    const tasksRef = collection(db, "users", userID, "todoLists", listID, "Tasks");

    try {
        // get not completed tasks
        const tasksQuery = query(tasksRef);
        const unsuscribe = onSnapshot(tasksQuery, (tasksSnapshot) => {
            const tasks = tasksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTasks(tasks);
        });
        return unsuscribe;
    } catch (error) {
        console.log("Could not retrieve tasks: ", error);
    }


};

export const getListsHome = async () => {
    const userID = auth.currentUser?.uid;
    if (!userID) return [];

    const listsRef = collection(db, "users", userID, "todoLists");

    try {
        const listsQuery = query(listsRef);
        const queryResult = await getDocs(listsQuery);
        const lists = queryResult.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).filter(list => list.id !== "Upcoming");
        return lists;
    } catch (error) {
        console.log("Could not get tasks lists: ", error);
        return [];
    }
};

// get all lists, including upcoming
export const getAllLists = async () => {
    const userID = auth.currentUser?.uid;
    if (!userID) return [];

    const listsRef = collection(db, "users", userID, "todoLists");

    try {
        const listsQuery = query(listsRef);
        const queryResult = await getDocs(listsQuery);
        const lists = queryResult.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return lists;
    } catch (error) {
        console.log("Could not get tasks lists: ", error);
        return [];
    }
};

export const getProgress = async (listID, setProgress) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return 0;

    const tasksRef = collection(db, "users", userID, "todoLists", listID, "Tasks");

    try {
        // get completed tasks
        const completedQuery = query(tasksRef, where("completed", "==", true));
        const unsuscribeCompleted = onSnapshot(completedQuery, (completedSnapshot) => {
            const totalCompleted = completedSnapshot.docs.length;
            // to get all tasks length and update if changes
            const allTasksQuery = query(tasksRef);
            const unsuscribeAllTasks = onSnapshot(allTasksQuery, (allTasksSnapshot) => {
                const totalTasks = allTasksSnapshot.docs.length;

                const progress = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;
                setProgress(progress);
            });
            return unsuscribeAllTasks;
        });
        return unsuscribeCompleted;
    } catch (error) {
        console.log("Could not calculate progress: ", error);
    }
};