import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getProgress } from "./TasksDB"
import { CircularProgress } from 'react-native-circular-progress';
import { ListsContext } from "../../contexts/ListsContext";
import { ThemeContext } from '../../contexts/ThemeContext';

const TasksItemHome = ({ listID, navigation }) => {
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
      <TouchableOpacity style={{ alignItems: "center" }} onPress={() => navigation.navigate("Tasks", { listID: listID })}>
        <CircularProgress
          size={50}
          width={4}
          fill={progress}
          tintColor={theme.name === "light" ? '#4B4697' : "#1C1C1C"}
          backgroundColor='#DBDADA'
        >
          {(fill) => <Text style={{ fontSize: 16, fontFamily: "Zain-Regular", color: theme.name === "light" ? "#000000" : "#FFFFFF" }}>
            {`${fill.toFixed(0)}%`}
          </Text>}
        </CircularProgress>
        <Text style={styles.textList}>{listID}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function TasksHome({ navigation }) {
  const { allLists } = useContext(ListsContext);
  const { theme } = useContext(ThemeContext);
  const styles = useStyles(theme);

  return (
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
          <TasksItemHome listID={item.id} navigation={navigation} />
        )}
      />
    </View>
  );
};

const useStyles = (theme) => StyleSheet.create({
  tasksView: {
    backgroundColor: theme.container,
    width: "90%",
    height: "18%",
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: "center",
    padding: 10
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
    textAlign: "center",
  }
});
