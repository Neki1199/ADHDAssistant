import { Alert } from 'react-native';
import { db, auth } from "../../firebaseConfig";
import {
    doc, updateDoc, getDocs, increment,
    collection, query, where,
    onSnapshot, getDoc, setDoc, deleteDoc,
    deleteField, writeBatch
} from '@firebase/firestore';
import { scheduleNotification } from '../screens/Tasks/Modals/NewTask/Notifications';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteUser } from 'firebase/auth';

// add a new task to a specific list
export const addTask = async (name, date, time, reminder, repeat, duration, completed, list, completedDate, parentID = null) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    try {
        const taskRef = doc(collection(db, "users", userID, "todoLists", list, "Tasks"));
        await setDoc(taskRef, {
            id: taskRef.id, name, date, time, reminder, repeat, duration, completed, list, completedDate, parentID
        });

        const task = await getDoc(taskRef);
        return { id: taskRef.id, data: task.data() };
    } catch (error) {
        console.log("Error adding task: ", error);
        Alert.alert(
            "⚠️ Ups!",
            "Error adding new task",
            [{ text: "Try Again", style: "default" }]
        );
    }
};

export const addRepeatedTasks = async (datesRepeat, task) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    try {
        const batch = writeBatch(db); //create a batch, so its faster to add repeated tasks
        const repeated = [];
        datesRepeat.forEach((dateRepeat) => {
            // add repeated tasks, but if starts is == to task date, do not add (to not create same task twice)
            if (dateRepeat !== task.date) {
                const taskRef = doc(collection(db, "users", userID, "todoLists", task.list, "Tasks"));
                const newData = {
                    id: taskRef.id,
                    name: task.name,
                    date: dateRepeat,
                    time: task.time,
                    reminder: task.reminder,
                    repeat: task.repeat,
                    duration: task.duration,
                    completed: false,
                    list: task.list,
                    completedDate: "",
                    parentID: task.id
                }
                batch.set(taskRef, newData);
                repeated.push(newData);
            }
        });
        await batch.commit();
        for (const repeatTask of repeated) {
            // add notification
            if (repeatTask.reminder && repeatTask.date) {
                const reminderTime = dayjs(`${repeatTask.date} ${repeatTask.reminder}`, "YYYY-MM-DD HH:mm").toDate();
                scheduleNotification(reminderTime, `Remember your task "${repeatTask.name}". Starts at ${repeatTask.reminder}`, task.id, repeatTask.id);
            }
        }
        return repeated;
    } catch (error) {
        console.log("Error adding repeated tasks: ", error);
    }
};

// to add more repeated tasks
export const addMoreRepeatedTasks = async () => {
    const currentDate = dayjs().format("YYYY-MM-DD");

    try {
        const keys = await AsyncStorage.getAllKeys();
        // get all keys from repeat tasks
        const repeatKeys = keys.filter(key => key.startsWith("repeat_"));
        const tasks = await AsyncStorage.multiGet(repeatKeys);
        const repeatedTasks = tasks.map(([key, value]) => ({
            key,
            task: JSON.parse(value)
        }));

        for (const task of repeatedTasks) {
            const taskData = task.task;
            // add more tasks when there is less than 10 days for the last task
            if (dayjs(taskData.date).diff(dayjs(currentDate), "day") < 10) {
                // add more repeated tasks
                let dateValue = taskData.date; // start day from this task
                let datesRepeat = getDatesRepeat(dateValue, taskData.repeat);
                const repeated = [];

                for (const dateRepeat of datesRepeat) {
                    // add repeated tasks, but if starts is == to task date, do not add (to not create same task twice)
                    if (dateRepeat !== taskData.date) {
                        const newTask = await addTask(taskData.name, dateRepeat, taskData.time, taskData.reminder,
                            taskData.repeat, taskData.duration, false,
                            taskData.list, "", taskData.parentID);

                        repeated.push(newTask.data);

                        // add notification
                        if (taskData.reminder && taskData.date) {
                            const reminderTime = dayjs(`${dateRepeat} ${taskData.reminder}`, "YYYY-MM-DD HH:mm").toDate();
                            scheduleNotification(reminderTime, `Remember your task "${taskData.name}". Starts at ${taskData.reminder}`, taskData.parentID, newTask.id);
                        }
                    }
                }
                // remove from asyncstorage the last task and add new last task
                await AsyncStorage.removeItem(task.key);

                const lastTask = repeated[repeated.length - 1];
                if ((lastTask.repeat.ends !== "Never" && dayjs(lastTask.date).isBefore(lastTask.repeat.ends))
                    || lastTask.repeat.ends === "Never") {
                    storeLastRepeat(lastTask);
                }
            }
        }
    } catch (error) {
        console.log("Could not add more repeated tasks, :", error);
    }
};

// get dates from repeat field, date is the starts field in repeat, not date from task
export const getDatesRepeat = (date, repeat) => {
    const datesRepeat = [];
    const startDate = dayjs(date);
    let currentDate = startDate;
    const maxTasks = 30; // limit of tasks created
    const days = repeat.days;

    const dayMap = {
        "Mon": 0,
        "Tue": 1,
        "Wed": 2,
        "Thu": 3,
        "Fri": 4,
        "Sat": 5,
        "Sun": 6
    };

    // add intervals from starts
    while (true) {
        if (repeat.type === "Daily") {
            datesRepeat.push(currentDate.format("YYYY-MM-DD"));
            currentDate = currentDate.add(repeat.every, "day");
        } else if (repeat.type === "Weekly") {
            days.forEach(day => {
                const dayIndex = dayMap[day]; // get day index
                // add one more day (so its exact, as dayjs starts on sunday)
                const oneDayMore = currentDate.day(dayIndex).add(1, "day");

                if ((oneDayMore.isAfter(startDate) || oneDayMore.isSame(startDate))
                    && ((oneDayMore.isBefore(repeat.ends) || oneDayMore.isSame(repeat.ends)))) {
                    datesRepeat.push(oneDayMore.format("YYYY-MM-DD"));
                }
            });
            currentDate = currentDate.add(repeat.every, "week");
        } else if (repeat.type === "Monthly") {
            // handle 30-31
            if (repeat.dayMonth === "Last") {
                currentDate = currentDate.endOf("month");
            } else {
                // get smaller day (if 31, get 28, or 30)
                const daysInMonth = currentDate.daysInMonth();
                const smallerDay = Math.min(repeat.dayMonth, daysInMonth);
                currentDate = currentDate.date(smallerDay);
            }
            // break beforehand if its after
            if (repeat.ends !== "Never" && currentDate.isAfter(dayjs(repeat.ends))) {
                break;
            }
            datesRepeat.push(currentDate.format("YYYY-MM-DD"));

            currentDate = currentDate.add(repeat.every, "month");
        } else if (repeat.type === "Yearly") {
            // break beforehand if year is after
            if (repeat.ends !== "Never" && currentDate.isAfter(dayjs(repeat.ends))) {
                break;
            }
            datesRepeat.push(currentDate.format("YYYY-MM-DD"));
            currentDate = currentDate.add(repeat.every, "year");
        }

        if (repeat.ends === "Never") {
            if (datesRepeat.length >= maxTasks) break;
        } else if (repeat.ends !== "Never" && currentDate.isAfter(dayjs(repeat.ends))) {
            break;
        }
    }
    return datesRepeat;
};

// store the last repeat
export const storeLastRepeat = async (lastRepeat) => {
    try {
        await AsyncStorage.setItem(`repeat_${lastRepeat.parentID}`, JSON.stringify(lastRepeat));
    } catch (error) {
        console.log("Could not store last repeat: ", error);
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

export const deleteTask = async (task, taskID = null) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;
    let taskRef;

    if (taskID === null) {
        taskRef = doc(db, "users", userID, "todoLists", task.list, "Tasks", task.id);
    } else {
        taskRef = doc(db, "users", userID, "todoLists", task.list, "Tasks", taskID);
    }

    try {
        await deleteDoc(taskRef);
    } catch (error) {
        console.log("Error removing task: ", error)
        Alert.alert(
            "⚠️ Ups!",
            "Error deleting task",
            [{ text: "Try Again", style: "default" }]
        );
    }
};

export const deleteAllCompleted = async (listID) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    const tasksRef = collection(db, "users", userID, "todoLists", listID, "Tasks");
    const queryTasks = query(tasksRef, where("completed", "==", true));

    try {
        const completedResult = await getDocs(queryTasks);
        const batch = writeBatch(db); // to delete many documents

        completedResult.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();

    } catch (error) {
        console.log("Error removing all completed tasks: ", error)
        Alert.alert(
            "⚠️ Ups!",
            "Error deleting all completed tasks",
            [{ text: "Try Again", style: "default" }]
        );
    }
};

export const setCompleted = async (task) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    const currentDate = dayjs().format("YYYY-MM-DD");
    const taskRef = doc(db, "users", userID, "todoLists", task.list, "Tasks", task.id);

    try {
        // add completedDate to check on progress
        await updateDoc(taskRef, { completed: true, completedDate: currentDate });
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
        await updateDoc(taskRef, { completed: false, completedDate: "" });
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

    const oldListRef = collection(db, "users", userID, "todoLists", listID, "Tasks");
    const progressRef = doc(db, "users", userID, "otherToDo", "progress");
    const newListRef = doc(db, "users", userID, "todoLists", newName);

    try {
        // get old progress
        const progressDoc = await getDoc(progressRef);
        const oldProgress = progressDoc.exists() ? progressDoc.data()[listID] : 0;

        // get all tasks from old
        const oldListData = await getDocs(oldListRef);

        // use writeBatch to do all in parallel (to not show on the UI a list being added, and then deleted)
        const batch = writeBatch(db);

        // create new list, check that it does not exist
        const newListDoc = await getDoc(newListRef);
        if (!newListDoc.exists()) {
            batch.set(newListRef, {});
        } else {
            Alert.alert(
                "⚠️ Ups!",
                "List already exists, enter new name",
                [{ text: "Try Again", style: "default" }]
            );
            return;
        }
        // update progress before moving tasks
        batch.update(progressRef, {
            [newName]: oldProgress,
            [listID]: deleteField()
        });

        // move each task and change its list field
        oldListData.docs.forEach((taskDoc) => {
            const taskData = taskDoc.data();
            const newTaskRef = doc(db, "users", userID, "todoLists", newName, "Tasks", taskDoc.id);
            batch.set(newTaskRef, { ...taskData, list: newName });
            batch.delete(doc(db, "users", userID, "todoLists", listID, "Tasks", taskDoc.id))
        });

        // delete old list
        batch.delete(doc(db, "users", userID, "todoLists", listID));
        await batch.commit(); // all changes at once

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
    const tasksRef = collection(db, "users", userID, "todoLists", listID, "Tasks");
    const progressRef = doc(db, "users", userID, "otherToDo", "progress");

    try {
        const tasksResult = await getDocs(tasksRef);
        const batch = writeBatch(db);

        // delete each task before deleting the list (if not it still shows the list on firestore)
        tasksResult.docs.forEach((taskDoc) => {
            const taskRef = doc(db, "users", userID, "todoLists", listID, "Tasks", taskDoc.id);
            batch.delete(taskRef);
        })

        batch.delete(listRef);
        // also delete the progress counter
        batch.update(progressRef, { [listID]: deleteField() });

        await batch.commit();
    } catch (error) {
        console.log("Could not delete list: ", error);
        Alert.alert(
            "⚠️ Ups!",
            "Error removing list",
            [{ text: "Try Again", style: "default" }]
        );
    }
};

// get all tasks from a list
export const getTasks = (listID, setTasks) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return () => { };

    const tasksRef = collection(db, "users", userID, "todoLists", listID, "Tasks");
    const tasksQuery = query(tasksRef);

    // get all tasks (completed, and not completed)
    const unsubscribe = onSnapshot(tasksQuery, (tasksSnapshot) => {
        const tasks = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setTasks(tasks);
    }, error => {
        console.error("Error in getTasks:", error);
    }
    );
    return unsubscribe;
};

// get all uncompleted tasks of a month from a list
export const getUncompletedMonth = (listID, year, month, setDatedTasks, setUndatedTasks) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return () => { };

    const startDate = dayjs(`${year}-${month}-01`).startOf("month").format("YYYY-MM-DD");
    const endDate = dayjs(`${year}-${month}-01`).endOf("month").format("YYYY-MM-DD");

    const tasksRef = collection(db, "users", userID, "todoLists", listID, "Tasks");

    // with date
    const tasksQuery = query(tasksRef,
        where("completed", "==", false),
        where("date", ">=", startDate),
        where("date", "<=", endDate),
    );

    // without date
    const noDateQuery = query(tasksRef,
        where("completed", "==", false),
        where("date", "==", "")
    )

    // get all tasks (completed, and not completed)
    const unsubscribe = onSnapshot(tasksQuery, (tasksSnapshot) => {
        const tasks = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setDatedTasks(tasks);
    });

    const unsubscribeNoDate = onSnapshot(noDateQuery, (tasksNoDate) => {
        const noDateTasks = tasksNoDate.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setUndatedTasks(noDateTasks);
    });

    return () => {
        unsubscribe();
        unsubscribeNoDate();
    }
};



// get all lists, including upcoming (setAllList to set them)
export const getAllLists = (setAllLists) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return () => { };

    const listsRef = collection(db, "users", userID, "todoLists");

    try {
        const listsQuery = query(listsRef);
        const unsubscribe = onSnapshot(listsQuery, (listsSnapshot) => {
            const lists = listsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAllLists([...lists]);
        }, error => {
            console.error("Error in getAllLists:", error);
        }
        );
        return unsubscribe;
    } catch (error) {
        console.log("Could not get tasks lists: ", error);
        return () => { };
    }
};

// to calculate % of progress on home screen
export const getProgress = (listID, setProgress) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return () => { };

    const currentDate = dayjs().format("YYYY-MM-DD");
    const tasksRef = collection(db, "users", userID, "todoLists", listID, "Tasks");

    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
        let totalTasksDaily = 0; // for total daily tasks
        let completedTasksDaily = 0; // for daily completed

        snapshot.docs.forEach(doc => {
            const taskData = doc.data();
            const taskDate = taskData.date;
            const taskCompleted = taskData.completed;
            const completedDate = taskData.completedDate || null;

            // check if task is for today or past
            const isTodayTask = taskDate === currentDate;
            const isPastUncompleted = taskDate < currentDate && !taskCompleted;
            const isPastCompleted = (taskDate < currentDate && taskCompleted) && (completedDate === currentDate);

            // count tasks that are for today (or past uncompleted / completed today)
            if (isTodayTask || isPastUncompleted || isPastCompleted) {
                totalTasksDaily++;
            }

            // check completed for today
            if (taskCompleted && completedDate === currentDate) {
                completedTasksDaily++;
            }
        }, error => {
            console.error("Error in getProgress:", error);
        }
        );
        if (totalTasksDaily === 0) {
            setProgress(-1); // if there is no tasks for today
        } else {
            setProgress(totalTasksDaily > 0 ? (completedTasksDaily / totalTasksDaily) * 100 : 0);
        }
    });
    return unsubscribe;
};

export const getTasksProgress = async (setProgress) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return () => { };

    const progressRef = doc(db, "users", userID, "otherToDo", "progress");

    try {
        const unsubscribe = onSnapshot(progressRef, (progressDoc) => {
            const progress = progressDoc.data();
            setProgress(progress);
        }, error => {
            console.error("Error in getTasksProgress:", error);
        });
        return unsubscribe;
    } catch (error) {
        console.log("Error retrieving tasks progress: ", error)
    };
};

export const deleteRepeatedTasks = async (task) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return () => { };

    const parentID = task.parentID ? task.parentID : task.id;
    const tasksRef = collection(db, "users", userID, "todoLists", task.list, "Tasks");
    const tasksQuery = query(tasksRef, where("parentID", "==", parentID));

    try {
        const resultTasks = await getDocs(tasksQuery);
        const batch = writeBatch(db);

        resultTasks.forEach((eachTask) => {
            batch.delete(eachTask.ref)
        });

        await batch.commit();
    } catch (error) {
        console.log("Could not delete parentID tasks: ", error)
    }
};

export const deleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // delete data stored in firestore
        const userRef = doc(db, "users", user.uid);
        await deleteDoc(userRef);

        await deleteUser(user); // delete user from authentication

        Alert.alert(
            "Account Deleted",
            "Your account has been successfully deleted",
            [{ text: "Try Again", style: "default" }]
        );
    } catch (error) {
        Alert.alert(
            "⚠️ Ups!",
            "Error deleting account",
            [{ text: "Try Again", style: "default" }]
        );
        console.log("Error deleting account: ", error);
    };
};