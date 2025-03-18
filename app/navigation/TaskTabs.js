import React, { useState, useEffect, useContext } from "react";
import { View, Text, Alert, StatusBar, Modal, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { addNewList, changeList, deleteList } from "../screens/Tasks/TasksDB";
import ListTasks from "../screens/Tasks/TabLists";
import ListUpcoming from "../screens/Tasks/TabUpcoming";
import { AntDesign } from "@expo/vector-icons";
import { ListsContext } from "../contexts/ListsContext";
import { ThemeContext } from "../contexts/ThemeContext";

const Tab = createMaterialTopTabNavigator();

const ListModal = ({ modalVisible, setModalVisible, listName, setListName }) => {
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

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
                            <AntDesign name="close" size={30} color={theme.name === "light" ? "#4B4697" : "#FFFFFF"} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>New List</Text>
                        <TouchableOpacity onPress={() => addList()}>
                            <AntDesign name="checkcircle" size={30} color={theme.name === "light" ? "#4B4697" : "#FFFFFF"} />
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter list name"
                        value={listName}
                        onChangeText={setListName}
                        placeholderTextColor={theme.text}
                    />
                </View>
            </View>
        </Modal>
    );
}

const ChangeDeleteModal = ({ modalChangeVisible, setModalChangeVisible, setNewListName, renameList, selectedListName, newListName, isRenaming }) => {
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    const onDelete = async () => {
        deleteList(selectedListName);
        setModalChangeVisible(false);
        setNewListName(""); // if user has entered something!
    };

    return (
        <Modal transparent={true} visible={modalChangeVisible} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalInside}>
                    <View style={styles.topModal}>
                        <TouchableOpacity onPress={() => { setModalChangeVisible(false), setNewListName("") }}>
                            <AntDesign name="close" size={30} color={theme.name === "light" ? "#4B4697" : "#FFFFFF"} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Change List</Text>
                        <TouchableOpacity onPress={renameList}>
                            <AntDesign name="checkcircle" size={30} color={theme.name === "light" ? "#4B4697" : "#FFFFFF"} />
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder={selectedListName}
                        value={newListName}
                        onChangeText={setNewListName}
                        placeholderTextColor={theme.text}
                    />
                    {isRenaming ? (
                        <ActivityIndicator size="large" color="#0000ff"
                            style={{ marginTop: 20 }} />
                    ) : (
                        <TouchableOpacity
                            style={styles.btnDelete}
                            onPress={onDelete}>
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
    const { theme } = useContext(ThemeContext);

    const [modalVisible, setModalVisible] = useState(false);
    const [listName, setListName] = useState("");
    const [selectedListName, setSelectedListName] = useState("");
    const [newListName, setNewListName] = useState("");
    const [modalChangeVisible, setModalChangeVisible] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false); // to not show the process of adding and deleting a list

    // change header
    useEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: theme.header
            },
            headerLeft: () => (
                <TouchableOpacity
                    onPress={() => navigation.popToTop()}
                    style={{ paddingHorizontal: 15 }}
                >
                    <AntDesign name="leftcircle" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => navigation.navigate("Tasks", { openModal: true })}
                    style={{ paddingHorizontal: 15, alignItems: "center", marginTop: 5 }}
                >
                    <AntDesign name="plus" size={26} color="#FFFFFF" />
                    <Text style={{ fontSize: 10, color: "#FFFFFF", fontFamily: "monospace" }}>Add List</Text>
                </TouchableOpacity>
            ),
        });
    }, [theme, navigation]);

    // params from App.js where the header is set
    useEffect(() => {
        if (route.params?.openModal) {
            setModalVisible(true);
            navigation.setParams({ openModal: false })
        }
    }, [route.params]);

    // change status bar
    useEffect(() => {
        StatusBar.setBackgroundColor(theme.header);
        StatusBar.setBarStyle("light-content");
    }, [theme]);

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
                key={allLists.length}
                initialLayout={{ width: Dimensions.get("window").width }}
                initialRouteName={listID}
                screenOptions={{
                    swipeEnabled: false,
                    animationEnabled: false,
                    tabBarActiveTintColor: "#FFFFFF",
                    tabBarInactiveTintColor: theme.textTabTasks,
                    tabBarIndicatorStyle: {
                        backgroundColor: "#FFFFFF"
                    },
                    tabBarStyle: {
                        backgroundColor: theme.header,
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
                }}
            >
                {/* Daily first, then others, Upcoming last */}
                <Tab.Screen
                    key="Daily"
                    name="Daily"
                    component={ListTasks}
                    initialParams={{ listID: "Daily" }}
                />
                {allLists.filter(list => list.id !== "Upcoming" && list.id !== "Daily").map((list) => (
                    <Tab.Screen
                        key={list.id}
                        name={list.id}
                        component={ListTasks}
                        initialParams={{ listID: list.id }}
                        listeners={{
                            tabLongPress: () => {
                                setSelectedListName(list.id);
                                setModalChangeVisible(true);
                            }
                        }}
                    />))}
                <Tab.Screen
                    key="Upcoming"
                    name="Upcoming"
                    component={ListUpcoming}
                    initialParams={{ listID: "Upcoming" }}
                />
            </Tab.Navigator>
        </View>
    );
}

const useStyles = (theme) => StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)"
    },
    modalInside: {
        width: "90%",
        padding: 20,
        backgroundColor: theme.container,
        borderRadius: 10,
        alignItems: "center"
    },
    modalTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 25,
        marginBottom: 10,
        color: theme.tabText
    },
    topModal: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between"
    },
    input: {
        color: theme.text,
        fontFamily: "Zain-Regular",
        fontSize: 20,
        width: "90%",
        backgroundColor: theme.input,
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
        backgroundColor: theme.delete,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center"
    }
});