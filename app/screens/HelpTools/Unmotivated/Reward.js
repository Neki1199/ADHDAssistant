import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, FlatList, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback, Keyboard, Alert, Image } from "react-native";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { useContext } from "react";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { TasksContext } from "../../../contexts/TasksContext";
import { ListsContext } from "../../../contexts/ListsContext";
import dayjs from "dayjs";

const Reward = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { getTasksList } = useContext(TasksContext);
    const { allLists } = useContext(ListsContext);
    const [openModal, setOpenModal] = useState(false);
    const [name, setName] = useState("");
    const [remove, setRemove] = useState(false);

    const styles = useStyles(theme);
    const [rewards, setRewards] = useState([]);
    const [tasks, setTasks] = useState([]);

    const [rewardSelected, setRewardSelected] = useState("");
    const [tasksSelected, setTasksSelected] = useState({});
    const [listSelected, setListSelected] = useState("Daily");
    const currentDay = dayjs().format("YYYY-MM-DD");

    useEffect(() => {
        // get the stored and default rewards
        const getRewards = async () => {
            const stored = await AsyncStorage.getItem("rewards");
            const storedRewards = stored ? JSON.parse(stored) : [];
            setRewards(storedRewards);
        };
        getRewards();
    }, []);

    const addReward = async (reward) => {
        if (!reward.trim()) {
            Alert.alert(
                "⚠️ Error",
                "Enter a reward!",
                [{ text: "Try Again", style: "default" }]
            );
        } else {
            const updated = [...rewards, reward];
            setRewards(updated);
            await AsyncStorage.setItem("rewards", JSON.stringify(updated));
            setOpenModal(false);
            setName("");
        };
    };

    const deleteReward = async (reward) => {
        if (reward === rewardSelected) {
            setRewardSelected("");
        }
        const updated = rewards.filter(rew => rew !== reward);
        setRewards(updated);
        await AsyncStorage.setItem("rewards", JSON.stringify(updated));
    };

    useEffect(() => {
        getTasksList("Daily", (tasksRetrieved) => {
            const filteredTasks = tasksRetrieved.filter(task => (task.date <= currentDay || task.date === "")
                && task.completed === false);
            setTasks(filteredTasks);
        });
    }, []);

    const getListTasks = (listID) => {
        setListSelected(listID);
        getTasksList(listID, (tasksRetrieved) => {
            const filteredTasks = tasksRetrieved.filter(task => (task.date <= currentDay || task.date === "")
                && task.completed === false);
            setTasks(filteredTasks);
        });
    };

    const selectTask = (task, listID) => {
        setTasksSelected(prev => {
            const list = prev[listID] || [];
            const alreadyInList = list.some(t => t.id === task.id);
            return {
                ...prev,
                [listID]: alreadyInList
                    ? list.filter(t => t.id !== task.id)
                    : [...list, task]
            }
        });
    };

    const save = async () => {
        const allTasks = Object.values(tasksSelected).flat(); // combine all tasks
        if (allTasks.length === 0 || rewardSelected === "") {
            Alert.alert(
                "⚠️ Error",
                "Select at least one task and reward!",
                [{ text: "Try Again", style: "default" }]
            );
            return -1;
        } else {
            const storedTasks = await AsyncStorage.getItem("rewardTasks");
            const parseTasks = storedTasks ? JSON.parse(storedTasks) : [];
            // store object with reward and tasks
            const rewardAndTasks = {
                reward: rewardSelected,
                tasks: allTasks
            };
            const updatedStored = [...parseTasks, rewardAndTasks];

            await AsyncStorage.setItem("rewardTasks", JSON.stringify(updatedStored));

            setRewardSelected("");
            setTasksSelected({});
            return 1;
        };
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={async () => {
                        const result = await save();
                        if (result === 1) {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: "Tabs", params: { screen: "Home" } }]
                            });
                        }
                    }}
                    style={{ paddingHorizontal: 15 }}
                >
                    <AntDesign name="checkcircle" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            )
        });
    }, [navigation, save]);

    return (
        <LinearGradient
            colors={[theme.header, theme.linear2]}
            style={styles.gradient}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.tab }]}>Treat yourself with something you love</Text>

                <View style={styles.rewardView}>
                    <View style={styles.rewardsContainer}>
                        <Text style={[styles.title, { fontSize: 20 }]}>Choose one reward</Text>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.flatlist}
                            data={rewards}
                            keyExtractor={(item, index) => `${item}-${index}`}
                            renderItem={({ item }) => (
                                <View style={{ justifyContent: "center" }}>
                                    <TouchableOpacity style={[styles.reward, {
                                        width: 150, backgroundColor: item === rewardSelected
                                            ? theme.linear3 : theme.linear2
                                    }]} onPress={() => {
                                        // if is set to remove, select an item to remove
                                        if (remove) {
                                            deleteReward(item);
                                        } else {
                                            // else is set to select a reward
                                            if (rewardSelected === item) {
                                                setRewardSelected("");
                                            } else {
                                                setRewardSelected(item);
                                            }
                                        }
                                    }}>
                                        <Text style={[styles.rewardText, {
                                            color: item === rewardSelected
                                                ? theme.tab : theme.text
                                        }]}>{item}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            numColumns={2}
                        />
                    </View>
                </View>

                <View style={{ opacity: remove ? 1 : 0 }}>
                    <Text style={[styles.title, { fontSize: 18 }]}>Tap a reward to remove it</Text>
                </View>

                {/* add and delete btns */}
                <View style={styles.btnsView}>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: theme.name === "light" ? "#4B4697" : "#7C7A97" }]} onPress={() => setOpenModal(true)}>
                        <AntDesign name="plus" size={26} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: theme.name === "light" ? "#9B1515" : "#808080" }]}
                        onPress={() => setRemove(!remove)}>
                        <AntDesign name={remove ? "check" : "delete"} size={26} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* lists container */}
                <View style={[styles.rewardView, { height: 320, justifyContent: "flex-start" }]}>
                    <View style={styles.listsContainer}>
                        <Text style={[styles.title, { fontSize: 20, marginTop: 10 }]}>Select one or more tasks</Text>
                        <FlatList
                            showsHorizontalScrollIndicator={false}
                            horizontal={true}
                            contentContainerStyle={{ justifyContent: "center" }}
                            data={allLists}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={[styles.reward, {
                                    minWidth: 150, height: 45, justifyContent: "center",
                                    backgroundColor: listSelected === item.id ? theme.primary : theme.linear2
                                }]}
                                    onPress={() => getListTasks(item.id)}>
                                    <Text style={[styles.title, {
                                        fontFamily: "monospace", fontSize: 14,
                                        color: listSelected === item.id ? theme.tab : theme.text
                                    }]}>{item.id}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                    {/* tasks container */}
                    <View style={{ height: 190, width: "90%", borderRadius: 15, marginTop: 5 }}>
                        <FlatList
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ justifyContent: "center" }}
                            data={tasks}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={[styles.reward, {
                                    minWidth: 150, height: 45, justifyContent: "center",
                                    backgroundColor: (tasksSelected[item.list] || []).some(t => t.id === item.id) ?
                                        theme.primary : theme.linear2
                                }]}
                                    onPress={() => selectTask(item, item.list)}>
                                    <Text style={[styles.rewardText, {
                                        color: (tasksSelected[item.list] || []).some(t => t.id === item.id)
                                            ? theme.tab : theme.text
                                    }]}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Image
                                source={require("../../../../assets/images/completed.png")}
                                style={styles.img} />}
                        />
                    </View>
                </View>

                {openModal && (
                    <Modal visible={openModal} transparent={true} animationType="fade">
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                            <View style={styles.modalContainer}>
                                <View style={styles.modalInside}>
                                    <View style={styles.topModal}>
                                        <TouchableOpacity onPress={() => { setOpenModal(false); setName(""); }}>
                                            <AntDesign name="close" size={30} color={theme.tabText} />
                                        </TouchableOpacity>
                                        <Text style={styles.modalTitle}>Add Reward</Text>
                                        <TouchableOpacity onPress={() => addReward(name)}>
                                            <AntDesign name="checkcircle" size={30} color={theme.tabText} />
                                        </TouchableOpacity>
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Reward"
                                        value={name}
                                        onChangeText={setName}
                                        placeholderTextColor={theme.name === "light" ? "#808080" : "#FFFFFF"}
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                )}
            </View>
        </LinearGradient >
    );
};

const useStyles = (theme) => StyleSheet.create({
    gradient: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 10
    },
    container: {
        width: "90%",
        alignItems: "center"
    },
    title: {
        fontFamily: "Zain-Regular",
        fontSize: 22,
        color: theme.textDate,
        textAlign: "center"
    },
    rewardView: {
        marginTop: 20,
        backgroundColor: theme.container,
        width: "100%",
        height: 220,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 15,
    },
    rewardsContainer: {
        width: "90%",
        height: 180,
        justifyContent: "center",
        gap: 10
    },
    flatlist: {
        alignItems: "center"
    },
    reward: {
        backgroundColor: theme.linear2,
        padding: 10,
        borderRadius: 15,
        alignItems: "center",
        margin: 5
    },
    rewardText: {
        fontFamily: "Zain-Regular",
        fontSize: 20,
    },
    btnsView: {
        flexDirection: "row",
        width: "90%",
        justifyContent: "space-around",
    },
    btn: {
        width: 45,
        height: 45,
        padding: 5,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 30
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    modalInside: {
        width: "90%",
        padding: 20,
        backgroundColor: theme.modalNewTask,
        borderRadius: 30,
        alignItems: "center"
    },
    topModal: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        padding: 10
    },
    modalTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 25,
        marginBottom: 10,
        color: theme.tabText,
        textAlign: "center"
    },
    input: {
        fontFamily: "Zain-Regular",
        textAlign: "center",
        fontSize: 20,
        width: "100%",
        height: 60,
        backgroundColor: theme.itemModal,
        color: theme.text,
        borderRadius: 10,
        padding: 15,
    },
    listsContainer: {
        width: "90%",
        justifyContent: "center",
        gap: 10,
        marginTop: 10
    },
    img: {
        width: 200,
        height: 190,
        alignSelf: "center"
    }
});

export default Reward;