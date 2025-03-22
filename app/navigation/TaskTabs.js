import React, { useState, useEffect, useContext } from "react";
import { View, Alert, StyleSheet, Dimensions } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { changeList } from "../screens/Tasks/TasksDB";
import ListTasks from "../screens/Tasks/Screens/TabLists";
import ListUpcoming from "../screens/Tasks/Screens/TabUpcoming";
import { ListsContext } from "../contexts/ListsContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { AddList } from "../screens/Tasks/Modals/AddList";
import { ChangeDeleteList } from "../screens/Tasks/Modals/ChangeDeleteList";

const Tab = createMaterialTopTabNavigator();

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

    // params from App.js where the header is set
    useEffect(() => {
        if (route.params?.openModal) {
            setModalVisible(true);
            navigation.setParams({ openModal: false })
        }
    }, [route.params]);

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
            <ChangeDeleteList
                modalChangeVisible={modalChangeVisible}
                setModalChangeVisible={setModalChangeVisible}
                selectedListName={selectedListName}
                setNewListName={setNewListName}
                renameList={renameList}
                newListName={newListName}
                isRenaming={isRenaming}
            />

            <AddList
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