import React, { useContext, useState } from "react";
import { View, StyleSheet, Text, Modal, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeContext } from "../contexts/ThemeContext";
import { deleteAccount } from "../contexts/TasksDB";

export default function Settings({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const styles = useStyles(theme);
  const [openDelete, setOpenDelete] = useState(false);

  const deleteUser = () => {
    deleteAccount()
      .then(() => {
        navigation.navigate("SignIn");
      });
  };

  return (
    <LinearGradient
      colors={[theme.header, theme.linear2]}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setOpenDelete(true)} style={styles.btn}>
          <Text style={styles.textSettings}>Delete Account</Text>
        </TouchableOpacity>

        {openDelete && (
          <Modal transparent={true} visible={openDelete} animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalInside}>
                <Text style={styles.modalTitle}>Do you really want to delete your account?</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                  <TouchableOpacity style={[styles.btnModal, { backgroundColor: theme.primary }]} onPress={() => setOpenDelete(false)}>
                    <Text style={[styles.modalTitle, { color: "#FFFFFF" }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnModal} onPress={() => deleteUser()}>
                    <Text style={[styles.modalTitle, { color: "#FFFFFF" }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </LinearGradient>
  );
};

const useStyles = (theme) => StyleSheet.create({
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20
  },
  container: {
    width: "90%",
    padding: 10,
    alignItems: "center",
    backgroundColor: theme.container,
    borderRadius: 15

  },
  btn: {
    width: 200,
    height: 50,
    padding: 10,
    backgroundColor: theme.container,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15
  },
  btnModal: {
    width: 120,
    height: 40,
    backgroundColor: theme.activetab,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15
  },
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
  },
  modalTitle: {
    fontFamily: "Zain-Regular",
    fontSize: 25,
    marginBottom: 10,
    color: theme.tabText,
    textAlign: "center"
  },
  textSettings: {
    fontFamily: "Zain-Regular",
    fontSize: 18,
    color: theme.tabText,
    textAlign: "center"
  }
});