import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Modal, FlatList, TouchableOpacity, Alert } from "react-native";
import { doc, updateDoc, getDoc, arrayUnion } from "@firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { useEmotions } from "../contexts/EmotionContext";
import AntDesign from "react-native-vector-icons/AntDesign";

export default function SettingEmotions({ navigation }) {
    const { allEmotions, setAllEmotions } = useEmotions();
    const [visibleModal, setVisibleModal] = useState(false);
    const [visibleChangeDelete, setVisibleChangeDelete] = useState(false);
    const [visibleChange, setVisibleChange] = useState(false);
    const [emojiIcon, setEmojiIcon] = useState("");
    const [emotionTxt, setEmotionTxt] = useState("");
    const [selectedEmotion, setSelectedEmotion] = useState(null);

    const addEmotion = async () => {
        const userID = auth.currentUser.uid;
        const userRef = doc(db, "users", userID);

        const newEmotion = { emoji: emojiIcon, name: emotionTxt };

        if (!emojiIcon || !emotionTxt) {
            Alert.alert("⚠️ Ups!", "Enter all fields", [
                { text: "Try Again", style: "default" },
            ]);
            return;
        }

        // check that the emoji is not already on the db
        if (allEmotions.some(
            (emotion) => emotion.name === newEmotion.name)) {
            Alert.alert("⚠️ Fail", "Emotion already exists", [
                { text: "Try Again", style: "default" },
            ]);
            return;
        }

        // add the new emotion
        try {
            await updateDoc(userRef, {
                emotions: arrayUnion(newEmotion),
            });
            setVisibleModal(false);
            setEmojiIcon("");
            setEmotionTxt("");
        } catch (error) {
            Alert.alert("⚠️ Fail", "Emotion not added", [
                { text: "Try Again", style: "default" },
            ]);
        }
    };

    const deleteEmotion = async () => {
        if (!selectedEmotion) return;
        const userID = auth.currentUser.uid;
        const emotionsRef = doc(db, "users", userID);

        try {
            const updatedEmotions = allEmotions.filter(
                (emotion) => emotion.name !== selectedEmotion.name
            );

            await updateDoc(emotionsRef, { emotions: updatedEmotions });
            setVisibleChangeDelete(false);
        } catch (error) {
            console.error("Error deleting emotion: ", error);
        }
    };

    const changeEmotion = async () => {
        if (!selectedEmotion) return;
        const userID = auth.currentUser.uid;
        const emotionsRef = doc(db, "users", userID);

        // check if there are changes
        if (selectedEmotion.name === emotionTxt && selectedEmotion.emoji === emojiIcon) {
            Alert.alert("⚠️ Ups!", "No changes made", [
                { text: "Try Again", style: "default" },
            ]);
            return;
        }

        try {
            const docResult = await getDoc(emotionsRef);
            if (docResult.exists()) {
                const existingEmotions = docResult.data().emotions || [];
                const updatedEmotions = existingEmotions.map((emotion) =>
                    emotion.name === selectedEmotion.name
                        ?
                        { emoji: emojiIcon, name: emotionTxt }
                        : emotion
                );
                await updateDoc(emotionsRef, { emotions: updatedEmotions });
                setVisibleChange(false);
            }
        } catch (error) {
            console.log(error);
            Alert.alert("⚠️ Fail", "Emotion could not be changed", [
                { text: "Try Again", style: "default" },
            ]);
        }
    };

    const emotionPressed = (emotion) => {
        setSelectedEmotion(emotion);
        setVisibleChangeDelete(true);
    };

    // add modal to change or delete emoji

    return (
        <View style={styles.container}>
            <View style={styles.emotionContainer}>
                <Text style={styles.titleEmotions}>Emoji Settings</Text>
                <Text style={styles.descriptionEmoji}>Select to change or delete</Text>

                <FlatList
                    data={allEmotions}
                    keyExtractor={(item) => item.name}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => emotionPressed(item)}>
                            <View style={styles.emojiContainer}>
                                <Text style={styles.emoji}>{item.emoji}</Text>
                                <Text style={styles.emojiText}>{item.name}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    numColumns={4}
                />

                <TouchableOpacity
                    style={styles.buttonPlus}
                    onPress={() => {
                        setVisibleModal(true)
                        setEmojiIcon("")
                        setEmotionTxt("")
                    }}>
                    <AntDesign color="#FFFFFF" size={20} name={"plus"} />
                </TouchableOpacity>
            </View>

            {/** add emotion modal */}
            <Modal transparent={true} visible={visibleModal} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalInside}>
                        <Text style={styles.modalTitle}>New Emotion</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Add emoji icon"
                            value={emojiIcon}
                            onChangeText={setEmojiIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Add emotion"
                            value={emotionTxt}
                            onChangeText={setEmotionTxt}
                        />
                        <View style={styles.buttonsModal}>
                            <TouchableOpacity
                                style={[styles.buttons, { backgroundColor: "#B90000" }]}
                                onPress={() => {
                                    setVisibleModal(false);
                                    setEmojiIcon("");
                                    setEmotionTxt("");
                                }}
                            >
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.buttons, { backgroundColor: "#4B4697" }]}
                                onPress={addEmotion}
                            >
                                <Text style={styles.btnText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/** change or delete modal */}
            <Modal
                transparent={true}
                visible={visibleChangeDelete}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalInsideCD}>

                        <View style={styles.buttonsModal}>
                            <TouchableOpacity
                                style={[styles.buttons, { backgroundColor: "#4B4697" }]}
                                onPress={() => {
                                    setVisibleChangeDelete(false);
                                    setVisibleChange(true);
                                    setEmojiIcon(selectedEmotion.emoji);
                                    setEmotionTxt(selectedEmotion.name);
                                }}>
                                <Text style={styles.btnText}>Change</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.buttons, { backgroundColor: "#DF0000" }]}
                                onPress={deleteEmotion}
                            >
                                <Text style={styles.btnText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={[styles.buttons, { backgroundColor: "#FFFFFF" }]}
                            onPress={() => setVisibleChangeDelete(false)}
                        >
                            <Text style={[styles.btnText, { color: "#4B4697", textDecorationLine: "underline" }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/** change modal */}
            <Modal
                transparent={true}
                visible={visibleChange}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalInside}>
                        <Text style={styles.modalTitle}>Edit Emotion</Text>

                        <TextInput
                            style={styles.input}
                            value={emojiIcon}
                            onChangeText={setEmojiIcon}
                        />
                        <TextInput
                            style={styles.input}
                            value={emotionTxt}
                            onChangeText={setEmotionTxt}
                        />

                        <View style={styles.buttonsModal}>
                            <TouchableOpacity
                                style={[styles.buttons, { backgroundColor: "#B90000" }]}
                                onPress={() =>
                                    setVisibleChange(false)}
                            >
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.buttons, { backgroundColor: "#4B4697" }]}
                                onPress={changeEmotion}
                            >
                                <Text style={styles.btnText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#4B4697",
    },
    emotionContainer: {
        paddingHorizontal: 10,
        width: "95%",
        height: "45%",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderRadius: 20,
    },
    titleEmotions: {
        marginTop: 10,
        fontFamily: "Zain-Regular",
        fontSize: 25,
    },
    descriptionEmoji: {
        color: "#4B4697",
        fontFamily: "Zain-Regular",
        fontSize: 15,
        marginBottom: 10,
    },
    emojiContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        margin: 5,
        width: 75,
    },
    emoji: {
        fontSize: 30,
    },
    emojiText: {
        fontFamily: "monospace",
        fontSize: 10,
        fontWeight: "500",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    modalInside: {
        width: "70%",
        padding: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 50,
        alignItems: "center",
    },
    modalInsideCD: {
        width: "70%",
        padding: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        alignItems: "center",
    },
    modalTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 25,
        marginBottom: 10,
        color: "#4B4697",
    },
    input: {
        width: "60%",
        height: 50,
        fontFamily: "Zain-Regular",
        fontSize: 20,
        backgroundColor: "#F0F0F0",
        borderRadius: 10,
        marginBottom: 10,
        padding: 10,
    },
    buttonsModal: {
        flexDirection: "row",
        margin: 10,
        width: "100%",
        justifyContent: "space-around",
    },
    buttonPlus: {
        width: 50,
        height: 50,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4B4697",
        marginBottom: 20,
    },
    buttons: {
        width: 100,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    btnText: {
        fontFamily: "Zain-Regular",
        fontSize: 18,
        color: "#FFFFFF",
        fontWeight: "500",
    },
});
