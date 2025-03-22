import React, { useContext } from "react";
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { deleteList } from "../TasksDB";
import { AntDesign } from "@expo/vector-icons";
import { ThemeContext } from "../../../contexts/ThemeContext";

export const ChangeDeleteList = ({ modalChangeVisible, setModalChangeVisible, setNewListName, renameList, selectedListName, newListName, isRenaming }) => {
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