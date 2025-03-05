import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import EmotionsHome from "../screens/Emotions/EmotionsScreen";
import TasksHome from "../screens/Tasks/TasksHomeScreen"
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }) {

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#7D79C0", "#EBEAF6"]}
        style={styles.gradient}>
        <EmotionsHome />
        <TasksHome navigation={navigation} />
      </LinearGradient>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
    gap: 30
  }
});