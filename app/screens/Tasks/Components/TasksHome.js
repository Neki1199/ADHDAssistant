import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getProgress } from "../../../contexts/TasksDB"
import { CircularProgress } from 'react-native-circular-progress';
import { ListsContext } from "../../../contexts/ListsContext";
import { ThemeContext } from '../../../contexts/ThemeContext';
import { AntDesign } from '@expo/vector-icons';
import ModalNewTask from '../Screens/NewTask/ModalNewTask';
import { AddList } from '../Modals/AddList';

const TasksItemHome = ({ listID }) => {
  const [progress, setProgress] = useState(0);
  const { theme } = useContext(ThemeContext);
  const styles = useStyles(theme);

  // onsanpshot to get updates from lists and tasks
  useEffect(() => {
    const unsuscribe = getProgress(listID, setProgress);
    return () => { if (unsuscribe && typeof unsuscribe === "function") { unsuscribe(); } }
  }, [listID]);

  return (
    <View style={styles.listItem}>
      <CircularProgress
        size={50}
        width={4}
        fill={progress}
        tintColor={theme.name === "light" ? '#4B4697' : "#1C1C1C"}
        backgroundColor='#DBDADA'
      >
        {(fill) => <Text style={{ fontSize: 16, fontFamily: "Zain-Regular", color: theme.name === "light" ? "#000000" : "#FFFFFF" }}>
          {fill === -1 ? "--" : `${fill.toFixed(0)}%`}
        </Text>}
      </CircularProgress>
      <Text style={styles.textList}>{listID}</Text>
    </View>
  );
};

export default function TasksHome() {
  const { allLists } = useContext(ListsContext);
  const { theme } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [listModal, setListModal] = useState(false);
  const [listName, setListName] = useState("");
  const styles = useStyles(theme);

  return (
    <View style={{ alignItems: "center" }}>
      <View style={styles.tasksView}>
        <Text style={styles.textTasks}>Tasks</Text>
        <FlatList
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1
          }}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          data={[
            ...allLists.filter(list => list.id === "Daily"), // daily first!
            ...allLists.filter(list => list.id !== "Daily" && list.id !== "Upcoming")
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TasksItemHome listID={item.id} />
          )}
        />

        {/* add list modal */}
        <ModalNewTask modalVisible={modalVisible} setModalVisible={setModalVisible}
          list="Daily" task={null} />
        {/* add task modal */}
        <AddList
          modalVisible={listModal}
          setModalVisible={setListModal}
          listName={listName}
          setListName={setListName}
        />
      </View>
      {/* buttons */}
      <View style={{ flexDirection: "row", gap: 20, padding: 10 }}>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.btn, { backgroundColor: theme.primary }]}>
          <AntDesign name="plus" size={22} color="#FFFFFF" />
          <Text style={[styles.textList, { color: "#FFFFFF" }]}>Add Task</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setListModal(true)} style={[styles.btn, { backgroundColor: theme.linear3, }]}>
          <AntDesign name="plus" size={22} color="#FFFFFF" />
          <Text style={[styles.textList, { color: "#FFFFFF" }]}>Add List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const useStyles = (theme) => StyleSheet.create({
  tasksView: {
    backgroundColor: theme.container,
    width: "90%",
    height: 150,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: "center",
    padding: 10,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  textTasks: {
    fontFamily: "Zain-Regular",
    fontSize: 25,
    color: theme.tabText
  },
  listItem: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 9
  },
  textList: {
    color: theme.text,
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center"
  },
  btn: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 10,
    width: 120,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  }
});
