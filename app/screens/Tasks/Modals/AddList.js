import React, { useContext } from "react";
import { View, Text, Alert, Modal, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { addNewList } from "../../../contexts/TasksDB";
import { AntDesign } from "@expo/vector-icons";
import { ThemeContext } from "../../../contexts/ThemeContext";

export const AddList = ({ modalVisible, setModalVisible, listName, setListName }) => {
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
                        autoFocus={true}
                    />
                </View>
            </View>
        </Modal>
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
        height: 66,
        backgroundColor: theme.input,
        borderRadius: 20,
        padding: 20,
    },
});