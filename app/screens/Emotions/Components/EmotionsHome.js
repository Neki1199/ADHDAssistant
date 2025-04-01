import React, { useContext, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { doc, updateDoc, getDoc, setDoc, arrayUnion } from '@firebase/firestore';
import { db, auth } from "../../../../firebaseConfig";
import dayjs from "dayjs";
import { ThemeContext } from '../../../contexts/ThemeContext';
import { AntDesign } from '@expo/vector-icons';

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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.modalContainer}>
            <View style={styles.modalInside}>

              <View style={styles.topModal}>
                <TouchableOpacity onPress={() => { setVisibleModal(false), setNote("") }}>
                  <AntDesign name="close" size={26} color={theme.name === "light" ? "#4B4697" : "#FFFFFF"} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{
                  selectedEmotion ? `Why are you feeling ${selectedEmotion.emoji}?` : "Select an emotion"}</Text>
                <TouchableOpacity onPress={() => storeEmotion(selectedEmotion)}>
                  <AntDesign name="checkcircle" size={26} color={theme.name === "light" ? "#4B4697" : "#FFFFFF"} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.noteInput}
                placeholder="Add and optional note"
                value={note}
                onChangeText={setNote}
                placeholderTextColor={theme.text}
                autoFocus={true}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>

      </Modal>
    </View>
  )
};

const useStyles = (theme) => StyleSheet.create({
  emotionsView: {
    backgroundColor: theme.container,
    width: "90%",
    height: 150,
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,

    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4
  },
  topModal: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between"
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
  }
})