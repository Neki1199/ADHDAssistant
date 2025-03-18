import React, { useContext } from "react";
import { View, TouchableWithoutFeedback, StyleSheet, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { ThemeContext } from "../../../contexts/ThemeContext";

const TaskDetails = ({ modalInputs, taskDetails, showLists, listsItems, setShowLists, resetTaskDetail, otherList, setOtherList }) => {
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    return (
        <View style={styles.inputsContainer}>
            {modalInputs.map((modalInput, index) => {
                const { nameInput, icon, inputFunction, setValue } = modalInput;
                const cancelSet = taskDetails[nameInput]?.cancel;

                return (
                    <View key={index} style={styles.itemInput}>
                        {/* name of detail */}
                        <View style={styles.iconAndName}>
                            <AntDesign name={icon} size={22} color={theme.text} />
                            <Text style={styles.inputText}>{nameInput}</Text>
                        </View>
                        {/* modal to select the list */}
                        {nameInput === "List" && showLists && (
                            <Modal visible={showLists} transparent={true} animationType="slide">
                                <TouchableWithoutFeedback onPress={() => setShowLists(false)} accessible={false}>
                                    <View style={[styles.modalContainer, { justifyContent: "center" }]}>
                                        <View style={styles.modalInside}>
                                            <FlatList
                                                style={{ width: "100%" }}
                                                keyExtractor={(item) => item.id}
                                                data={listsItems}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity style={[styles.listItem,
                                                    {
                                                        backgroundColor: theme.name === "light" ?
                                                            (item.id === otherList ? "#9B94D7" : "#EBEAF6")
                                                            : (item.id === otherList ? "#24214A" : "#7C7A97")
                                                    }]}
                                                        onPress={() => {
                                                            setShowLists(false);
                                                            setOtherList(item.id);
                                                        }}>
                                                        <Text style={styles.listText}>
                                                            {item.id}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>
                        )}

                        {cancelSet ? (
                            // cancel icon at right
                            <TouchableOpacity style={styles.iconAndName} onPress={() => resetTaskDetail(nameInput)}>
                                <Text style={[styles.inputText, { color: theme.tabText }]}>{setValue}</Text>
                                <AntDesign name="close" size={22} color={theme.tabText} />
                            </TouchableOpacity>
                        ) : (
                            // button right
                            <TouchableOpacity
                                style={styles.iconAndName} onPress={inputFunction}
                                disabled={nameInput === "List" && listsItems.length === 1}
                            >
                                <Text style={[styles.inputText, {
                                    color: nameInput === "List" &&
                                        listsItems.length === 1 ? theme.name === "light" ? "#C0C0C0" : "#A0A0A0"
                                        : theme.tabText
                                }]}>{setValue}</Text>
                                <AntDesign name="right" size={22}
                                    color={nameInput === "List" &&
                                        listsItems.length === 1 ? theme.name === "light" ? "#C0C0C0" : "#A0A0A0"
                                        : theme.text}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                )
            })}
        </View>
    );
};


const useStyles = (theme) => StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    modalInside: {
        padding: 20,
        backgroundColor: theme.container,
        alignItems: "center",
        height: "auto",
        maxHeight: 300,
        width: "70%",
        borderRadius: 15
    },
    inputsContainer: {
        marginTop: 40,
        width: "100%"
    },
    itemInput: {
        backgroundColor: theme.itemModal,
        justifyContent: "space-between",
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingVertical: 14,
        borderRadius: 10,
        marginBottom: 10
    },
    iconAndName: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    inputText: {
        fontFamily: "Zain-Regular",
        fontSize: 22,
        color: theme.text
    },
    listItem: {
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        width: "90%",
        backgroundColor: theme.header,
        margin: 10,
        borderRadius: 15
    },
    listText: {
        fontFamily: "Zain-Regular",
        fontSize: 18,
        color: theme.text
    }
});

export default TaskDetails;