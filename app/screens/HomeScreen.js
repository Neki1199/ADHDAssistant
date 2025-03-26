import * as SystemUI from "expo-system-ui";
import React, { useContext, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import EmotionsHome from "../screens/Emotions/Components/EmotionsHome";
import TasksHome from "../screens/Tasks/Components/TasksHome"
import { LinearGradient } from "expo-linear-gradient";
import { ThemeContext } from "../contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { getDatesRepeat, storeLastRepeat } from "./Tasks/Modals/ModalNewTask";
import { addTask } from "../contexts/TasksDB";
import { scheduleNotification } from "./Tasks/Components/Notifications";

export default function HomeScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const styles = useStyles(theme);

  // to not show white when keyboard open
  useEffect(() => {
    const setBackground = async () => {
      await SystemUI.setBackgroundColorAsync(theme.container);
    };
    setBackground();
  }, []);

  // to add more repeated tasks
  const addMoreRepeatedTasks = async () => {
    const currentDate = dayjs().format("YYYY-MM-DD");

    try {
      const keys = await AsyncStorage.getAllKeys();
      // get all keys from repeat tasks
      const repeatKeys = keys.filter(key => key.startsWith("repeat_"));
      const tasks = await AsyncStorage.multiGet(repeatKeys);
      const repeatedTasks = tasks.map(([key, value]) => ({
        key,
        task: JSON.parse(value)
      }));

      for (const task of repeatedTasks) {
        const taskData = task.task;
        // add more tasks when there is less than 10 days for the last task
        if (dayjs(taskData.date).diff(dayjs(currentDate), "day") < 10) {
          // add more repeated tasks
          let dateValue = taskData.date; // start day from this task
          let datesRepeat = getDatesRepeat(dateValue, taskData.repeat);
          const repeated = [];

          for (const dateRepeat of datesRepeat) {
            // add repeated tasks, but if starts is == to task date, do not add (to not create same task twice)
            if (dateRepeat !== taskData.date) {
              const newTask = await addTask(taskData.name, dateRepeat, taskData.time, taskData.reminder,
                taskData.repeat, taskData.duration, false,
                taskData.list, "", taskData.parentID);

              repeated.push(newTask.data);

              // add notification
              if (taskData.reminder && taskData.date) {
                const reminderTime = dayjs(`${dateRepeat} ${taskData.reminder}`, "YYYY-MM-DD HH:mm").toDate();
                scheduleNotification(reminderTime, `Remember your task "${taskData.name}". Starts at ${taskData.reminder}`, taskData.parentID, newTask.id);
              }
            }
          }
          // remove from asyncstorage the last task and add new last task
          await AsyncStorage.removeItem(task.key);

          const lastTask = repeated[repeated.length - 1];
          if ((lastTask.repeat.ends !== "Never" && dayjs(lastTask.date).isBefore(lastTask.repeat.ends))
            || lastTask.repeat.ends === "Never") {
            storeLastRepeat(lastTask);
          }
        }
      }
    } catch (error) {
      console.log("Could not add more repeated tasks, :", error);
    }
  };

  // to only run once per day add more repeated
  useEffect(() => {
    const checkOnce = async () => {
      const today = dayjs().format("YYYY-MM-DD");
      const lastRun = await AsyncStorage.getItem("lastRepeatCheck");

      // store today date so that is known that this functions has runned already
      if (lastRun !== today) {
        await addMoreRepeatedTasks();
        await AsyncStorage.setItem("lastRepeatCheck", today);
      }
    };
    checkOnce();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.header, theme.linear2]}
        style={styles.gradient}>
        <EmotionsHome />
        <TasksHome navigation={navigation} />

        <View style={styles.containerInside}>
          <TouchableOpacity onPress={() => navigation.navigate("Help")} style={[styles.btn,
          { backgroundColor: theme.name === "light" ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.1)" }
          ]}>
            <Text style={styles.text}>Tasks Help</Text>
            <Image
              source={require("../../assets/images/help.png")}
              style={styles.img} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View >

  );
};

const useStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1
  },
  gradient: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 10,
    gap: 30
  },
  containerInside: {
    flex: 1,
    padding: 10,
    width: "90%",
    justifyContent: "center",
    alignContent: "flex-start",
    bottom: 50
  },
  btn: {
    borderRadius: 100,
    alignItems: "center",
    width: 160,
    padding: 15,

  },
  text: {
    color: theme.tabText,
    fontFamily: "Zain-Regular",
    fontSize: 20,
    textAlign: "center"
  },
  img: {
    width: 100,
    height: 100,
    marginTop: 5,
  }
});