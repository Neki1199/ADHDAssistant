import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SegmentedControlTab from "react-native-segmented-control-tab";
import EmotionsProgress from "./Emotions/EmotionsProgress";
import TasksProgress from "./Tasks/TasksProgress";
import { LinearGradient } from 'expo-linear-gradient';

const Progress = () => {
  const [selectedIndex, setSelectedIndex] = useState(0); // start at emotions

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#7D79C0", "#EBEAF6"]}
        style={styles.gradient}>
        <SegmentedControlTab
          values={["Emotions", "Tasks"]}
          selectedIndex={selectedIndex}
          onTabPress={setSelectedIndex}
          tabsContainerStyle={styles.tabsContainer}
          tabStyle={styles.tab}
          activeTabStyle={styles.activeTab}
          tabTextStyle={styles.tabText}
          activeTabTextStyle={styles.activeTabText}
        />

        {/* use postion absolute and display none, moves the items to not unmount
So when changed of segment tab, it wont loose the state it was */}
        <View style={{ flex: 1, width: "100%", position: "relative" }}>
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: selectedIndex === 0 ? "flex" : "none" }}>
            <EmotionsProgress />
          </View>
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: selectedIndex === 1 ? "flex" : "none" }}>
            <TasksProgress />
          </View>
        </View>
      </LinearGradient>
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  tabsContainer: {
    width: "90%",
    marginBottom: 20
  },
  tab: {
    borderColor: "transparent"
  },
  activeTab: {
    backgroundColor: "#0F0A51"
  },
  tabText: {
    color: "#4B4697",
    fontSize: 16,
    fontFamily: "Zain-Regular"
  },
  activeTabText: {
    color: "#FFFFFF"
  },
});

export default Progress;