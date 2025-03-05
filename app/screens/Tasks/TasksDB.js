import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { db, auth } from "../../../firebaseConfig";
import {
    doc, updateDoc, getDocs, increment,
    collection, query, where, arrayUnion,
    onSnapshot, getDoc, setDoc, arrayRemove, deleteDoc,
    deleteField
} from '@firebase/firestore';

// add a new task to a specific list
export const addTask = async (name, date, time, reminder, repeat, duration, completed, list, isPast) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    try {
        const taskRef = doc(collection(db, "users", userID, "todoLists", list, "Tasks"));
        await setDoc(taskRef, {
            id: name,
            name, date, time, reminder, repeat, duration, completed, list, isPast
        });
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

    const taskRef = doc(db, "users", userID, "todoLists", task.list, "Tasks", task.id);
    try {
        await updateDoc(taskRef, newData);
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

    const taskRef = doc(db, "users", userID, "todoLists", task.list, "Tasks", task.id);
    try {
        await deleteDoc(taskRef);
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
    const currentDate = new Date(); //change
    const taskDate = task.date;
    console.log("Current date setispast: ", currentDate);
    console.log("task date: ", taskDate);

    if (taskDate < currentDate) {
        return { ...task, isPast: true };
    }
    return task;
};

// to move task to the completed or past collection
export const changeToCompletedList = async (task) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

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

    const taskRef = doc(db, "users", userID, "todoLists", task.list, "Tasks", task.id);
    try {
        await updateDoc(taskRef, { completed: true });
        // add +1 to list on progress
        await addCompletedCount(task);
    } catch (error) {
        console.log("Error marking completed task: ", error);
    }
};

export const setNotCompleted = async (task) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    const taskRef = doc(db, "users", userID, "todoLists", task.list, "Tasks", task.id);

    try {
        await updateDoc(taskRef, { completed: false });
        // -1 to the list on progress, and total
        await removeCompletedCount(task);

    } catch (error) {
        console.log("Error to set to not completed task: ", error);
    }
};

// add +1 to the counters
export const addCompletedCount = async (task) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    const progressListRef = doc(db, "users", userID, "otherToDo", "progress");

    try {
        await updateDoc(progressListRef, {
            [task.list]: increment(1),
            Total: increment(1)
        });

    } catch (error) {
        console.log("Error incrementing count progress: ", error);
    }
};

// -1 to the counters
export const removeCompletedCount = async (task) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    const progressListRef = doc(db, "users", userID, "otherToDo", "progress");

    try {
        await updateDoc(progressListRef, {
            [task.list]: increment(-1),
            Total: increment(-1)
        });

    } catch (error) {
        console.log("Error decrementing count progress: ", error);
    }
};

// listID is the name of the list
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
            return;
        }
        // create list
        await setDoc(listRef, {});

        // create progress counter
        const progressListRef = doc(db, "users", userID, "otherToDo", "progress")
        await setDoc(progressListRef, { [listID]: 0 }, { merge: true });
    } catch (error) {
        console.log("Could not add list: ", error);
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

    const oldListRef = doc(db, "users", userID, "todoLists", listID);
    const newListRef = doc(db, "users", userID, "todoLists", newName);

    try {
        // delete old and create a new one (not possible to change ID name)
        const oldListData = await getDoc(oldListRef);
        await setDoc(newListRef, oldListData.data());
        await deleteDoc(oldListRef);
    } catch (error) {
        console.log("Could not change list: ", error);
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
    const progressRef = doc(db, "users", userID, "otherToDo", "progress");

    try {
        await deleteDoc(listRef)
        // also delete the progress counter
        await updateDoc(progressRef, { [listID]: deleteField() });
    } catch (error) {
        console.log("Could not delete list: ", error);
        Alert.alert(
            "⚠️ Ups!",
            "Error removing list",
            [{ text: "Try Again", style: "default" }]
        );
    }
};

// get tasks from a list
export const getTasks = (listID, setTasks) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return () => { };

    const tasksRef = collection(db, "users", userID, "todoLists", listID, "Tasks");
    const tasksQuery = query(tasksRef);

    // get all tasks (completed, and not completed)
    const unsuscribe = onSnapshot(tasksQuery, (tasksSnapshot) => {
        const tasks = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setTasks(tasks);
    });
    return unsuscribe;
};

// get all lists, including upcoming
export const getAllLists = (setAllLists) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return [];

    const listsRef = collection(db, "users", userID, "todoLists");

    try {
        const listsQuery = query(listsRef);
        const unsuscribe = onSnapshot(listsQuery, (listsSnapshot) => {
            const lists = listsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAllLists([...lists]);
        });
        return unsuscribe;
    } catch (error) {
        console.log("Could not get tasks lists: ", error);
        return () => { };
    }
};

// to calculate % of progress on home screen
export const getProgress = (listID, setProgress) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return () => { };

    const tasksRef = collection(db, "users", userID, "todoLists", listID, "Tasks");
    return onSnapshot(tasksRef, (snapshot) => {
        // get total tasks
        const totalTasks = snapshot.size;
        // get completed tasks
        const completedTasks = snapshot.docs.filter(doc => doc.data().completed).length;
        setProgress(totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0);
    });
};