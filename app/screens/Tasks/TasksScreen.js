import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { db } from "../../../firebaseConfig";
import { getListsHome, getProgress } from "../Tasks/TasksDB"
import { CircularProgress } from 'react-native-circular-progress';

const TaskProgress = ({ listID }) => {
  const [progress, setProgress] = useState(0);

  // onsanpshot to get updates from lists and tasks
  useEffect(() => {
    const unsuscribe = getProgress(listID, setProgress);
    return () => { if (unsuscribe === typeof ("function")) { unsuscribe(); } }
  }, [listID]);

  return (
    <View style={styles.listItem}>
      <Text>{listID}</Text>
      <CircularProgress
        size={40}
        width={5}
        fill={progress}
        tintColor='#4B4697'
        backgroundColor='#999'
      >
        {(fill) => <Text style={{ fontSize: 12 }}>{`${fill.toFixed(0)}%`}</Text>}
      </CircularProgress>
    </View>
  );
};

export default function TasksHome({ navigation }) {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    const getListsData = async () => {
      const listsData = await getListsHome();
      setLists(listsData);
    };
    getListsData();
  }, []);

  return (
    <View style={styles.tasksView}>
      <Text style={styles.textTasks}>Tasks</Text>
      {lists.map(list => (
        <TaskProgress key={list.id} listID={list.id} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tasksView: {
    backgroundColor: "#FFFFFF",
    width: "90%",
    height: "18%",
    borderRadius: 10,
    alignItems: 'center',
    padding: 10
  },
  textTasks: {
    fontFamily: "Zain-Regular",
    fontSize: 25
  },
});