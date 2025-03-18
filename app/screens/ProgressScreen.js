import React, { useContext, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SegmentedControlTab from "react-native-segmented-control-tab";
import EmotionsProgress from "./Emotions/EmotionsProgress";
import TasksProgress from "./Tasks/TasksProgress";
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../contexts/ThemeContext';

const Progress = () => {
  const { theme } = useContext(ThemeContext);
  const styles = useStyles(theme);
  const [selectedIndex, setSelectedIndex] = useState(0); // start at emotions

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.header, theme.linear2]}
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

const useStyles = (theme) => StyleSheet.create({
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
    backgroundColor: theme.tab,
    borderColor: "transparent"
  },
  activeTab: {
    backgroundColor: theme.activetab
  },
  tabText: {
    color: theme.tabText,
    fontSize: 16,
    fontFamily: "Zain-Regular"
  },
  activeTabText: {
    color: "#FFFFFF"
  },
});

export default Progress;