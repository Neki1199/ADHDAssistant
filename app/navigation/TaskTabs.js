import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Alert, StatusBar, Modal, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { getAllLists, addNewList } from "../screens/Tasks/TasksDB";
import ListTasks from "../screens/Tasks/TabLists";
import ListUpcoming from "../screens/Tasks/TabUpcoming";
import { useIsFocused } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
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
                        <TouchableOpacity style={[styles.button, styles.btnCreate]} onPress={() => addList()}>
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

export const ListsTabs = ({ route, navigation }) => {
    const { allLists } = useContext(ListsContext);
    const { listID } = route.params;
    const isFocused = useIsFocused();
    const [modalVisible, setModalVisible] = useState(false);
    const [listName, setListName] = useState("");

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

    if (allLists.length === 0) {
        return (
            <View>
                <Text>No Lists added</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
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
                    }
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)'
    },
    modalInside: {
        width: '90%',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        alignItems: 'center'
    },
    modalTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 25,
        marginBottom: 10,
        color: '#4B4697'
    },
    topModal: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between"
    },
    input: {
        fontFamily: "Zain-Regular",
        fontSize: 16,
        width: "90%",
        height: 60,
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        padding: 20,
    }
});