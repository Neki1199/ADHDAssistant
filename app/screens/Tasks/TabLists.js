import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { getTasks, setCompleted, setNotCompleted } from './TasksDB';
import { LinearGradient } from 'expo-linear-gradient';
import ModalNewTask from "./ModalNewTask";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import AntDesign from "react-native-vector-icons/AntDesign";
import dayjs from 'dayjs';

const TaskItem = ({ item, navigation }) => {
    const [checked, setChecked] = useState(item.completed);

    const changeChecked = async () => {
        if (!checked) {
            await setCompleted(item);
        } else {
            await setNotCompleted(item);
        }
        setChecked(!checked);
    };

    const getTotalMinutes = (duration) => {
        // get duration ("hh:mm") and convert to minutes for timer
        const [hours, minutes] = duration.split(":").map(Number);
        return `${hours * 60 + minutes}`;
    };

    return (
        <View style={[styles.taskItem, checked && styles.taskCompleted]}>
            <View style={styles.taskItemLeft}>
                <Text style={styles.taskItemText}>{item.name}</Text>
                <Text style={styles.taskItemTime}>
                    {item.time !== "" ?
                        dayjs(item.time, "HH:mm").format("HH:mm")
                        : "All day"
                    }
                </Text>
            </View>

            <View style={styles.taskItemRight}>
                {item.duration !== "" && (
                    <View style={styles.taskTimer}>
                        <Text style={styles.taskItemTime}>{getTotalMinutes(item.duration)} mins</Text>
                        <TouchableOpacity
                            onPress={() => {
                                if (!checked) {
                                    navigation.navigate("TaskTimer", { time: getTotalMinutes(item.duration) })
                                }
                            }}
                            disabled={checked}
                            style={{ opacity: checked ? 0.5 : 1 }}
                        >

                            <AntDesign name="play" size={24} color="#4B4697" />
                        </TouchableOpacity>
                    </View>
                )}
                <Checkbox
                    style={styles.checkbox}
                    value={checked}
                    onValueChange={changeChecked}
                    color={checked ? "#4B4697" : undefined}
                />
            </View>
        </View>
    );
};

const ListTasks = ({ route, navigation }) => {
    const { list } = route.params;
    const [tasks, setTasks] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const unsuscribe = getTasks(list, setTasks);
        return () => { if (unsuscribe && typeof unsuscribe === "function") { unsuscribe(); } }
    }, [list]); // change every time tasks change?? Works??

    // use AsyncStorage to get and store showCompleted state
    useEffect(() => {
        const loadShowCompleted = async () => {
            try {
                const itemData = await AsyncStorage.getItem(`showCompleted${list}`);
                if (itemData !== null) {
                    setShowCompleted(JSON.parse(itemData));
                }
            } catch (error) {
                console.log("Could not get showCompleted value: ", error);
            }
        };
        loadShowCompleted();
    }, [list]);

    const changeShowComplete = async () => {
        try {
            const newShow = !showCompleted;
            setShowCompleted(newShow);
            await AsyncStorage.setItem(`showCompleted${list}`, JSON.stringify(newShow));
        } catch (error) {
            console.log("Could not save showCompleted: ", error);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#7D79C0", "#EBEAF6"]}
                style={styles.gradient}>
                <View style={styles.tasksContainer}>
                    {/* incompleted tasks */}
                    {tasks.length === 0 ?
                        // add image, user has not added a task yet
                        <Image
                            source={require("../../../assets/images/addTask.png")}
                            style={styles.img} />
                        :
                        tasks.some(task => !task.completed) ?
                            <FlatList
                                style={styles.flatlist}
                                data={tasks.filter(task => !task.completed)}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <TaskItem item={item} navigation={navigation} />
                                )}
                            />
                            : tasks.every(task => task.completed) && (
                                //add image all completed!
                                <Image
                                    source={require("../../../assets/images/completed.png")}
                                    style={styles.img} />)
                    }
                    <TouchableOpacity
                        onPress={changeShowComplete}
                        style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}
                    >
                        <Text style={styles.buttonShowCompleted}>
                            {showCompleted ? "Hide Completed Tasks" : "Show Completed Tasks"}
                        </Text>
                        {showCompleted ?
                            <AntDesign name="up" size={20} color="grey" />
                            : <AntDesign name="down" size={20} color="grey" />
                        }
                    </TouchableOpacity>

                    {/* completed tasks */}
                    {showCompleted && tasks.some(task => task.completed) ?
                        (
                            <FlatList
                                style={styles.flatlist}
                                data={tasks.filter(task => task.completed)}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TaskItem item={item} navigation={navigation} />
                                )}
                            />
                        ) : showCompleted && <Text style={styles.textNoCompleted}>Nothing to show...</Text>}
                </View>

                {/* modal view add new task */}
                <View style={styles.addTaskView}>
                    <TouchableOpacity
                        style={styles.addTaskButton}
                        onPress={() => setModalVisible(true)}>
                        <AntDesign name="plus" size={22} color="#FFFFFF" />
                    </TouchableOpacity>

                    <ModalNewTask modalVisible={modalVisible} setModalVisible={setModalVisible} list={list} />
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    gradient: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "#4B4697"
    },
    tasksContainer: {
        marginTop: 20,
        justifyContent: "space-between",
        width: "95%",
        backgroundColor: "#FFFFFF",
        borderRadius: 15
    },
    taskItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#E4E3F6",
        width: "100%",
        padding: 10,
        borderRadius: 20,
        marginBottom: 10
    },
    taskItemLeft: {
        marginLeft: 10,
    },
    taskItemRight: {
        flexDirection: "row",
        marginRight: 10,
        alignItems: "center",
        gap: 20
    },
    taskItemText: {
        fontFamily: "Zain-Regular",
        fontSize: 18
    },
    taskTimer: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center"
    },
    taskItemTime: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#626262"
    },
    checkbox: {
        margin: 8,
        width: 24,
        height: 24
    },
    taskCompleted: {
        opacity: 0.5,
        backgroundColor: "#B7E2B0"
    },
    flatlist: {
        width: "100%",
        height: "auto",
        maxHeight: 300,
        paddingHorizontal: 10,
        paddingVertical: 10
    },
    buttonShowCompleted: {
        fontFamily: "Zain-Regular",
        color: "grey",
        fontSize: 18,
        textAlign: "center",
        marginBottom: 10
    },
    textNoCompleted: {
        fontFamily: "Zain-Regular",
        fontSize: 20,
        color: "#4B4697",
        textAlign: "center",
        padding: 20
    },
    addTaskView: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end",
        marginBottom: 20
    },
    addTaskButton: {
        borderRadius: 50,
        backgroundColor: "#4B4697",
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center"
    },
    img: {
        margin: 20,
        alignSelf: "center",
        width: 250,
        height: 250
    }
});

export default ListTasks;