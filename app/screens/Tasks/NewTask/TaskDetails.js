import React from "react";
import { View, TouchableWithoutFeedback, StyleSheet, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const TaskDetails = ({ modalInputs, taskDetails, showLists, listsItems, setShowLists, resetTaskDetail, otherList, setOtherList }) => {

    return (
        <View style={styles.inputsContainer}>
            {modalInputs.map((modalInput, index) => {
                const { nameInput, icon, inputFunction, setValue } = modalInput;
                const cancelSet = taskDetails[nameInput]?.cancel;

                return (
                    <View key={index} style={styles.itemInput}>
                        <View style={styles.iconAndName}>
                            <AntDesign name={icon} size={22} color={"#000000"} />
                            <Text style={styles.inputText}>{nameInput}</Text>
                        </View>
                        {/* modal to select the list */}
                        {nameInput === "List" && showLists && (
                            <Modal visible={showLists} transparent={true} animationType="slide">
                                <TouchableWithoutFeedback onPress={() => setShowLists(false)} accessible={false}>
                                    <View style={[styles.modalContainer, { justifyContent: "center" }]}>
                                        <View style={[styles.modalInside,
                                        { height: "auto", maxHeight: 300, width: "70%", borderRadius: 30, backgroundColor: "#FFFFFF" }]}>
                                            <FlatList
                                                style={{ width: "100%" }}
                                                showsVerticalScrollIndicator={false}
                                                keyExtractor={(item) => item.id}
                                                data={listsItems}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity style={[styles.listItem,
                                                    { backgroundColor: item.id === otherList ? "#9B94D7" : "#EBEAF6" }]}
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
                            <TouchableOpacity style={styles.iconAndName} onPress={() => resetTaskDetail(nameInput)}>
                                <Text style={[styles.inputText, { color: "#4B4697" }]}>{setValue}</Text>
                                <AntDesign name="close" size={22} color={"#000000"} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.iconAndName} onPress={inputFunction}
                                disabled={nameInput === "List" && listsItems.length === 1}
                            >
                                <Text style={[styles.inputText, {
                                    color: nameInput === "List" &&
                                        listsItems.length === 1 ? "#C0C0C0" : "#4B4697"
                                }]}>{setValue}</Text>
                                <AntDesign name="right" size={22}
                                    color={nameInput === "List" &&
                                        listsItems.length === 1 ? "#C0C0C0" : "#00000"}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                )
            })}
        </View>
    );
};


const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    modalInside: {
        width: "100%",
        height: "78%",
        padding: 20,
        backgroundColor: "#EBEAF6",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        alignItems: "center"
    },
    inputsContainer: {
        marginTop: 40,
        width: "100%"
    },
    itemInput: {
        backgroundColor: "#FFFFFF",
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
        color: '#000000'
    },
    listItem: {
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        width: "90%",
        backgroundColor: "#EBEAF6",
        margin: 10,
        borderRadius: 15
    },
    listText: {

    }
});

export default TaskDetails;