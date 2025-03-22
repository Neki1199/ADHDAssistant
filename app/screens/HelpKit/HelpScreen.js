import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

export const HelpScreen = ({ navigation }) => { // home emotions emoji
  const { theme } = useContext(ThemeContext);
  const styles = useStyles(theme);

  const allHelp = [
    { name: "Unmotivated", navigate: () => navigation.navigate("Unmotivated") },
    { name: "Overwhelmed", navigate: () => navigation.navigate("Overwhelmed") },
    { name: "Stuck", navigate: () => navigation.navigate("Stuck") },
    { name: "Disorganized", navigate: () => navigation.navigate("Disorganized") },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.header, theme.linear2]}
        style={styles.gradient}>
        <Text style={styles.title}>What is preventing you from completing the task?</Text>
      </LinearGradient>
    </SafeAreaView>
  )
};

const useStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1
  },
  gradient: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 10
  },
  title: {
    color: theme.tabText,
    fontFamily: "Zain-Regular",
    fontSize: 25
  }
});

export default HelpScreen;