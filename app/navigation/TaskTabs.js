import React, { useState, useEffect, useContext } from "react";
import { View, Text, Alert, StatusBar, Modal, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { addNewList, changeList, deleteList } from "../screens/Tasks/TasksDB";
import ListTasks from "../screens/Tasks/TabLists";
import ListUpcoming from "../screens/Tasks/TabUpcoming";
import { useIsFocused } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { ListsContext } from "../contexts/ListsContext";

const Tab = createMaterialTopTabNavigator();

const ListModal = ({ modalVisible, setModalVisible, listName, setListName }) => {
    const addList = () => {
        if (listName.trim() === "") {
            Alert.alert(
                "⚠️ Ups!",
                "List name cannot be empty",
                [{ text: "Try Again", style: "default" }]
            );
        } else {
            addNewList(listName);
            setModalVisible(false);
            setListName("");
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setListName("");
    };

    return (
        <Modal transparent={true} visible={modalVisible} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalInside}>
                    <View style={styles.topModal}>
                        <TouchableOpacity onPress={() => closeModal()}>
                            <AntDesign name="close" size={30} color={"#4B4697"} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>New List</Text>
                        <TouchableOpacity onPress={() => addList()}>
                            <AntDesign name="checkcircle" size={30} color={"#4B4697"} />
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter list name"
                        value={listName}
                        onChangeText={setListName}
                    />
                </View>
            </View>
        </Modal>
    );
}

const ChangeDeleteModal = ({ modalChangeVisible, setModalChangeVisible, setNewListName, renameList, selectedListName, newListName, isRenaming }) => {
    return (
        <Modal transparent={true} visible={modalChangeVisible} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalInside}>
                    <View style={styles.topModal}>
                        <TouchableOpacity onPress={() => { setModalChangeVisible(false), setNewListName("") }}>
                            <AntDesign name="close" size={30} color={"#4B4697"} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Change List</Text>
                        <TouchableOpacity onPress={renameList}>
                            <AntDesign name="checkcircle" size={30} color={"#4B4697"} />
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder={selectedListName}
                        value={newListName}
                        onChangeText={setNewListName}
                    />
                    {isRenaming ? (
                        <ActivityIndicator size="large" color="#0000ff"
                            style={{ marginTop: 20 }} />
                    ) : (
                        <TouchableOpacity
                            style={styles.btnDelete}
                            onPress={() => {
                                deleteList(selectedListName);
                                setModalChangeVisible(false);
                                setNewListName(""); // if user has entered something!
                            }}>
                            <AntDesign name="delete" size={24} color={"#FFFFFF"} />
                        </TouchableOpacity>)}
                </View>
            </View>
        </Modal>
    );
};

export const ListsTabs = ({ route, navigation }) => {
    const { allLists } = useContext(ListsContext);
    const { listID } = route.params;
    const isFocused = useIsFocused();

    const [modalVisible, setModalVisible] = useState(false);
    const [listName, setListName] = useState("");
    const [selectedListName, setSelectedListName] = useState("");
    const [newListName, setNewListName] = useState("");
    const [modalChangeVisible, setModalChangeVisible] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false); // to not show the process of adding and deleting a list

    // params from App.js where the header is set
    useEffect(() => {
        if (route.params?.openModal) {
            setModalVisible(true);
            navigation.setParams({ openModal: false })
        }
    }, [route.params]);

    // change status bar (different from others)
    useEffect(() => {
        if (isFocused) {
            StatusBar.setBackgroundColor("#4B4697");
            StatusBar.setBarStyle("light-content");
        } else {
            StatusBar.setBackgroundColor("#7D79C0");
        }
    }, [isFocused]);

    const renameList = async () => {
        if (newListName.trim() !== "") {
            setIsRenaming(true);
            await changeList(selectedListName, newListName); // change name
            setIsRenaming(false);
            setModalChangeVisible(false);
            setNewListName("");
        } else {
            Alert.alert(
                "⚠️ Ups!",
                "New name cannot be empty",
                [{ text: "Try Again", style: "default" }]
            );
        }
    };

    if (allLists.length === 0) {
        return (
            <View>
                <Text>No Lists added</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <ChangeDeleteModal
                modalChangeVisible={modalChangeVisible}
                setModalChangeVisible={setModalChangeVisible}
                selectedListName={selectedListName}
                setNewListName={setNewListName}
                renameList={renameList}
                newListName={newListName}
                isRenaming={isRenaming}
            />

            <ListModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                listName={listName}
                setListName={setListName}
            />
            <Tab.Navigator
                initialRouteName={listID}
                screenOptions={{
                    tabBarActiveTintColor: "#FFFFFF",
                    tabBarInactiveTintColor: "#000000",
                    tabBarIndicatorStyle: {
                        backgroundColor: "#FFFFFF"
                    },
                    tabBarStyle: {
                        backgroundColor: "#7D79C0",
                        elevation: 0,
                        shadowOpacity: 0
                    },
                    tabBarLabelStyle: {
                        fontFamily: "Zain-Regular",
                        fontSize: 20
                    },
                    tabBarScrollEnabled: true,
                    tabBarItemStyle: {
                        width: "auto",
                        paddingHorizontal: 22
                    },

                }}>
                {/* Daily first, then others, Upcoming last */}
                {allLists.some(list => list.id === "Daily") && (
                    <Tab.Screen
                        key="Daily"
                        name="Daily"
                        component={ListTasks}
                        initialParams={{ list: "Daily" }}
                    />
                )}

                {allLists.filter(list => list.id !== "Upcoming" && list.id !== "Daily").map((list) => (
                    <Tab.Screen
                        key={list.id}
                        name={list.id}
                        component={ListTasks}
                        initialParams={{ list: list.id }}
                        listeners={{
                            tabLongPress: () => {
                                if (list.id !== "Daily" && list.id !== "Upcoming") {
                                    setSelectedListName(list.id);
                                    setModalChangeVisible(true);
                                }
                            }
                        }}
                        options={{
                            tabBarLabel: ({ focused }) => (
                                <Text style={{
                                    color: focused ? "#FFFFFF" : "#000000",
                                    fontFamily: "Zain-Regular",
                                    fontSize: 20
                                }}>
                                    {list.id}
                                </Text>
                            )
                        }}
                    />))}

                {allLists.some(list => list.id === "Upcoming") && (
                    <Tab.Screen
                        key="Upcoming"
                        name="Upcoming"
                        component={ListUpcoming}
                        initialParams={{ list: "Upcoming" }}
                    />
                )}
            </Tab.Navigator>
        </View>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)"
    },
    modalInside: {
        width: "90%",
        padding: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        alignItems: "center"
    },
    modalTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 25,
        marginBottom: 10,
        color: "#4B4697"
    },
    topModal: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between"
    },
    input: {
        fontFamily: "Zain-Regular",
        fontSize: 20,
        width: "90%",
        backgroundColor: "#F0F0F0",
        borderRadius: 20,
        padding: 20,
    },
    textModalCancel: {
        fontFamily: "Zain-Regular",
        fontSize: 20,
        color: "#FFFFFF",
        textAlign: "center",
        justifyContent: "center"
    },
    btnDelete: {
        margin: 20,
        width: 40,
        height: 40,
        backgroundColor: "#9B1515",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center"
    }
});