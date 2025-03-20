import * as SystemUI from "expo-system-ui";
import React, { useContext, useEffect } from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import EmotionsHome from "../screens/Emotions/EmotionsScreen";
import TasksHome from "../screens/Tasks/Components/TasksHomeScreen"
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../contexts/ThemeContext';

export default function HomeScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);

  // to not show white when keyboard open
  useEffect(() => {
    const setBackground = async () => {
      await SystemUI.setBackgroundColorAsync(theme.container);
    };
    setBackground();
  }, []);

  // change status bar
  useEffect(() => {
    StatusBar.setBackgroundColor(theme.header);
    StatusBar.setBarStyle("light-content");
  }, [theme]);
  // add header

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.header, theme.linear2]}
        style={styles.gradient}>
        <EmotionsHome />
        <TasksHome navigation={navigation} />
      </LinearGradient>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
    gap: 30
  }
});