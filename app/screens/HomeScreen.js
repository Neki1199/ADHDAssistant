import * as SystemUI from "expo-system-ui";
import React, { useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import EmotionsHome from "../screens/Emotions/Components/EmotionsHome";
import TasksHome from "../screens/Tasks/Components/TasksHome";
import RewardsHome from "./Tasks/Components/RewardsHome";

import { LinearGradient } from "expo-linear-gradient";
import { ThemeContext } from "../contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { addMoreRepeatedTasks } from "../contexts/TasksDB";

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
        <TasksHome />
        <RewardsHome navigation={navigation} />
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
  }
});