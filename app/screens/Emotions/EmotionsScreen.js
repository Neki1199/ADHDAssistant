import React, { useContext, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { doc, updateDoc, getDoc, setDoc, arrayUnion } from '@firebase/firestore';
import { db, auth } from "../../../firebaseConfig";
import dayjs from "dayjs";
import { ThemeContext } from '../../contexts/ThemeContext';

export default function EmotionsHome() { // home emotions emoji
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [note, setNote] = useState("");
  const [visibleModal, setVisibleModal] = useState(false);
  const { theme } = useContext(ThemeContext);
  const styles = useStyles(theme);

  const allEmotions = [
    { emoji: "🟢", name: "green" },
    { emoji: "🟠", name: "orange" },
    { emoji: "🔴", name: "red" },
  ]

  const emotionPressed = (emotion) => {
    // select an emotion and appear a modal to add an optional note
    setSelectedEmotion(emotion);
    setVisibleModal(true);
  };

  const storeEmotion = async (emoji) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;
    const today = dayjs().format("YYYY-MM-DD");
    const time = dayjs().format("HH:mm:ss");

    // set note to was is written: it is an optional note
    const emotionData = { emoji: emoji.emoji, name: emoji.name, note, time };
    try {
      const docRef = doc(db, "users", userID, "emotionsTrack", today); // the document to use
      const docResult = await getDoc(docRef);  // to get the document

      if (docResult.exists()) {
        // add the emotion
        // does not accept arrays directly, 
        await updateDoc(docRef, { emotionsTrack: arrayUnion(emotionData) });
      } else {
        // create a new document for today's date
        await setDoc(docRef, { emotionsTrack: [emotionData] });
      }
    } catch (error) {
      Alert.alert(
        "⚠️ Ups!",
        "Error adding emotion",
        [{ text: "Try Again", style: "default" }]
      );

    }
    setVisibleModal(false);
    setNote("");
  };


  return (
    <View style={styles.emotionsView}>
      <Text style={styles.textEmotions}>How are you feeling today?</Text>
      <View style={{ flexDirection: "row" }}>
        {allEmotions.map((emotion) => (
          <TouchableOpacity
            style={{ margin: 15 }} key={emotion.name} onPress={() => emotionPressed(emotion)}>
            <Text style={{ fontSize: 40 }}>{emotion.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal transparent={true} visible={visibleModal} animationType='slide'>
        <View style={styles.modalContainer}>
          <View style={styles.modalInside}>
            <Text style={styles.modalTitle}>{
              selectedEmotion ? `Why are you feeling ${selectedEmotion.emoji}?` : "Select an emotion"}</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Add and optional note"
              value={note}
              onChangeText={setNote}
              placeholderTextColor={theme.text}
              autoFocus={true}
            />
            <View style={styles.buttonsModal}>
              <TouchableOpacity style={[styles.buttons, { backgroundColor: theme.name === "light" ? "#B90000" : "#56546F" }]} onPress={() => { setVisibleModal(false), setNote("") }}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.buttons, { backgroundColor: theme.name === "light" ? "#4B4697" : "#2A2572" }]} onPress={() => storeEmotion(selectedEmotion)}>
                <Text style={styles.btnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
};

const useStyles = (theme) => StyleSheet.create({
  emotionsView: {
    backgroundColor: theme.container,
    width: "90%",
    height: "18%",
    borderRadius: 10,
    alignItems: 'center',
    padding: 10
  },
  textEmotions: {
    color: theme.tabText,
    fontFamily: "Zain-Regular",
    fontSize: 25
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  },
  modalInside: {
    width: '90%',
    padding: 20,
    backgroundColor: theme.container,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalTitle: {
    fontFamily: "Zain-Regular",
    fontSize: 25,
    marginBottom: 10,
    color: theme.tabText
  },
  noteInput: {
    width: "100%",
    height: 50,
    fontFamily: "Zain-Regular",
    fontSize: 20,
    backgroundColor: theme.input,
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    color: theme.text
  },
  buttonsModal: {
    flexDirection: "row",
    margin: 10,
    width: "100%",
    justifyContent: "space-around",
  },
  buttons: {
    width: 100,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnText: {
    color: "#FFFFFF",
    fontWeight: "500"
  },
})