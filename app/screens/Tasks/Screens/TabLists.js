import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, FlatList, ScrollView, TouchableOpacity, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { getTasks, deleteAllCompleted } from '../../../contexts/TasksDB';
import { LinearGradient } from 'expo-linear-gradient';
import ModalNewTask from "./NewTask/ModalNewTask";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from "react-native-vector-icons/AntDesign";
import dayjs from 'dayjs';
import TaskItem from '../Components/TaskItem';
import { ModalStart } from '../Modals/ModalStart';
import { ThemeContext } from '../../../contexts/ThemeContext';
import { AddList } from '../Modals/AddList';

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

const ListTasks = ({ route, navigation }) => {
    const { listID } = route.params;
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    const [tasks, setTasks] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    // the modal to add a new list
    const [modalList, setModalList] = useState(false);
    const [listName, setListName] = useState("");

    const [modalDeleteAll, setModalDeleteAll] = useState(false);
    const currentDay = dayjs().format("YYYY-MM-DD");
    const [loading, setLoading] = useState(true);
    const [modalStart, setModalStart] = useState(false);
    const [showButtons, setShowButtons] = useState(false);

    useEffect(() => {
        const unsuscribe = getTasks(listID, (newTasks) => {
            // order tasks by past, current, and upcoming
            const sortedTasks = sortTasks(newTasks);
            setTasks(sortedTasks);
            setLoading(false);
        });
        return () => { if (unsuscribe && typeof unsuscribe === "function") { unsuscribe(); } }
    }, [listID]); // change every time listID change

    // use AsyncStorage to get and store showCompleted state
    useEffect(() => {
        const loadShowCompleted = async () => {
            try {
                const itemData = await AsyncStorage.getItem(`showCompleted${listID}`);
                if (itemData !== null) {
                    setShowCompleted(JSON.parse(itemData));
                }
            } catch (error) {
                console.log("Could not get showCompleted value: ", error);
            }
        };
        loadShowCompleted();
    }, [listID]);

    // to change if the user want to see or not the completed tasks
    const changeShowComplete = async () => {
        try {
            const newShow = !showCompleted;
            setShowCompleted(newShow);
            await AsyncStorage.setItem(`showCompleted${listID}`, JSON.stringify(newShow));
        } catch (error) {
            console.log("Could not save showCompleted: ", error);
        }
    };

    const deleteAllCompletedModal = () => {
        return (
            <Modal visible={modalDeleteAll} transparent={true} animationType="fade">
                <TouchableWithoutFeedback onPress={() => setModalDeleteAll(false)} accessible={false}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalInside}>
                            <TouchableOpacity style={styles.btnModal}
                                onPress={() => {
                                    deleteAllCompleted(listID)
                                    setModalDeleteAll(false)
                                }}>
                                <Text style={styles.modalTitle}>Delete all completed tasks</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }

    const filteredTasks = {
        pastAndCurrent: tasks.filter(task => task.date <= currentDay),
        uncompleted: tasks.filter(task => !task.completed),
        completed: tasks.filter(task => task.completed)
    };

    // get all tasks that are completed (for daily, only past and current tasks)
    const dailyAllTasksCompleted = filteredTasks.pastAndCurrent.every(task => task.completed);
    const dailyBeforeEqual = filteredTasks.uncompleted.filter(task => task.date <= currentDay);

    return (
        <LinearGradient
            colors={[theme.header, theme.linear2]}
            style={styles.gradient}>
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}>

                <View style={styles.tasksContainer}>
                    {/* uncompleted tasks */}
                    <View style={styles.touchShowComplete}>
                        <Text style={styles.sectionTitle}>Uncompleted Tasks</Text>
                        <TouchableOpacity
                            onPress={() => setModalDeleteAll(true)}
                            disabled={filteredTasks.completed.length === 0}
                            style={{ flexDirection: "row" }}
                        >
                            {dailyBeforeEqual.length > 0 && (
                                <View style={styles.number}>
                                    <Text style={{ fontSize: 12, color: theme.text }}>
                                        {dailyBeforeEqual.length}
                                    </Text>
                                </View>
                            )}
                            <AntDesign style={{ right: 10 }} name="ellipsis1" size={25}
                                color={
                                    filteredTasks.completed.length > 0 ? (theme.name === "light" ? "#404040" : "#FFFFFF") : (theme.name === "light" ? "#E0E0E0" : "#606060")
                                } />
                        </TouchableOpacity>
                    </View>
                    {loading ? (
                        <ActivityIndicator size="large" color="#7D79C0" />
                    ) : (
                        // uncompleted tasks
                        <FlatList
                            style={styles.flatlist}
                            data={dailyBeforeEqual}
                            keyExtractor={item => `${item.id}-${item.date}`}
                            renderItem={({ item }) => (
                                <TaskItem item={item} navigation={navigation} />
                            )}
                            scrollEnabled={false}
                            ListEmptyComponent={
                                //  incompleted tasks
                                dailyAllTasksCompleted && filteredTasks.completed.length > 0 ? (
                                    // image all completed!
                                    <Image
                                        source={require("../../../../assets/images/completed.png")}
                                        style={styles.img} />
                                ) : (
                                    // image user has not added a task yet
                                    <Image
                                        source={require("../../../../assets/images/addTask.png")}
                                        style={styles.img} />
                                )
                            }
                        />
                    )}

                    {/* hide or show completed tasks */}
                    <View style={styles.touchShowComplete}>
                        <Text style={styles.sectionTitle}>Completed Tasks</Text>
                        <TouchableOpacity onPress={changeShowComplete} style={{ flexDirection: "row" }}>
                            {filteredTasks.completed.length > 0 && (
                                <View style={styles.number}>
                                    <Text style={{ fontSize: 12, color: theme.text }}>
                                        {filteredTasks.completed.length}
                                    </Text>
                                </View>
                            )}
                            <AntDesign style={{ right: 10 }} name={showCompleted ? "up" : "down"} size={22} color={theme.name === "light" ? "#404040" : "#FFFFFF"} />
                        </TouchableOpacity>
                    </View>

                    {/* completed tasks */}
                    {showCompleted && (
                        <FlatList
                            style={styles.flatlist}
                            data={filteredTasks.completed}
                            keyExtractor={item => `${item.id}-${item.date}`}
                            renderItem={({ item }) => (
                                <TaskItem item={item} navigation={navigation} />
                            )}
                            scrollEnabled={false}
                            ListEmptyComponent={
                                <Image
                                    source={require("../../../../assets/images/tasksCompleted.png")}
                                    style={styles.img} />
                            }
                        />
                    )}
                </View>
            </ScrollView >

            <TouchableOpacity
                style={styles.addTaskButton}
                onPress={() => setShowButtons(!showButtons)}>
                <AntDesign name="plus" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {showButtons && (
                <View style={styles.bottomBtns}>
                    <TouchableOpacity
                        style={[styles.addTaskButton, { bottom: 55, left: 0, backgroundColor: theme.linear3 }]}
                        onPress={() => {
                            setShowButtons(false);
                            setModalVisible(true);
                        }}>
                        <Text style={{ fontSize: 12, color: "#FFFFFF", fontFamily: "monospace" }}>Task</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.addTaskButton, { bottom: 10, left: -40, backgroundColor: theme.linear3 }]}
                        onPress={() => {
                            setShowButtons(false);
                            setModalList(true);
                        }}>
                        <Text style={{ fontSize: 12, color: "#FFFFFF", fontFamily: "monospace" }}>List</Text>
                    </TouchableOpacity>
                </View>
            )}

            {modalList && (
                <AddList
                    modalVisible={modalList}
                    setModalVisible={setModalList}
                    listName={listName}
                    setListName={setListName}
                />
            )}

            {/* random button */}
            <TouchableOpacity
                style={[styles.pickRandomButton,
                { opacity: filteredTasks.pastAndCurrent.filter(task => !task.completed).length > 1 ? 1 : 0.5 }]}
                disabled={filteredTasks.pastAndCurrent.filter(task => !task.completed).length <= 1}
                onPress={() => setModalStart(true)}>
                <Image
                    source={require("../../../../assets/images/dice.png")}
                    style={styles.imgRandom} />
            </TouchableOpacity>

            <ModalNewTask modalVisible={modalVisible} setModalVisible={setModalVisible}
                list={listID} task={null} />

            <ModalStart tasks={listID === "Daily" ? filteredTasks.pastAndCurrent.filter(task => !task.completed)
                : filteredTasks.uncompleted} modalStart={modalStart} setModalStart={setModalStart} navigation={navigation} />

            {deleteAllCompletedModal()}
        </LinearGradient >
    );
};

const useStyles = (theme) => StyleSheet.create({
    gradient: {
        flex: 1,
        justifyContent: "flex-start"
    },
    scrollViewContent: {
        flexGrow: 1,
        alignItems: "center",
        padding: 10,
        paddingBottom: 0,
        width: "100%",
    },
    tasksContainer: {
        margin: 10,
        padding: 10,
        backgroundColor: theme.container,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginBottom: 65,
    },
    sectionTitle: {
        fontSize: 22,
        fontFamily: "Zain-Regular",
        color: theme.tabText,
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    touchShowComplete: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
        paddingHorizontal: 10,
        width: 360
    },
    addTaskButton: {
        borderRadius: 50,
        backgroundColor: theme.primary,
        width: 50,
        height: 50,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        bottom: 20,
        right: 28
    },
    pickRandomButton: {
        borderRadius: 50,
        backgroundColor: theme.primary,
        width: 50,
        height: 50,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        bottom: 20,
        left: 28
    },
    img: {
        margin: 20,
        alignSelf: "center",
        width: 250,
        height: 250
    },
    imgRandom: {
        width: 40,
        height: 40,
        position: "absolute",
        borderRadius: 50
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-start",
        paddingVertical: 200,
        paddingHorizontal: 10,
        alignItems: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalInside: {
        width: "70%",
        padding: 20,
        backgroundColor: theme.linear2,
        borderRadius: 15,
        alignItems: "center"
    },
    modalTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 20,
        color: theme.tabText,
        borderBottomWidth: 1,
        borderColor: "#C0C0C0"
    },
    topModal: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        padding: 10
    },
    number: {
        backgroundColor: theme.numberTasks,
        width: 25,
        height: 25,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        right: 20
    },
    bottomBtns: {
        flexDirection: "row",
        gap: 20,
        position: "absolute",
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "space-around",
        bottom: 20,
        right: 100
    }
});

export default ListTasks;