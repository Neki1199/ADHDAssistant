import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

export const HelpScreen = ({ navigation }) => { // home emotions emoji
  const { theme } = useContext(ThemeContext);
  const styles = useStyles(theme);

  const allHelp = [
    { name: "Unmotivated", colour: "#9999FF", navigate: () => navigation.navigate("Unmotivated"), img: require("../../../assets/images/unmotivated.png") },
    { name: "Overwhelmed", colour: "#FF9999", navigate: () => navigation.navigate("Overwhelmed"), img: require("../../../assets/images/overwhelmed.png") },
    { name: "Stuck", colour: "#FFCC99", navigate: () => navigation.navigate("Stuck"), img: require("../../../assets/images/stuck.png") },
    { name: "Disorganized", colour: "#99CCFF", navigate: () => navigation.navigate("Disorganized"), img: require("../../../assets/images/disorganised.png") },
  ];

  return (
    <LinearGradient
      colors={[theme.header, theme.linear2]}
      style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>What feeling is preventing you from completing tasks?</Text>
        <View style={styles.helpContainer}>
          {allHelp.map(item =>
            <TouchableOpacity key={item.name} style={[styles.viewHelp, { backgroundColor: item.colour }]} onPress={item.navigate}>
              <Text style={styles.textName}>{item.name}</Text>
              <Image
                source={item.img}
                style={styles.img} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  )
};

const useStyles = (theme) => StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 20
  },
  container: {
    width: "90%"
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "Zain-Regular",
    fontSize: 25,
    textAlign: "center"
  },
  helpContainer: {
    marginTop: 20,
    alignItems: "center",
    height: 600,
    justifyContent: "space-between"
  },
  viewHelp: {
    width: 300,
    padding: 10,
    alignItems: "center",
    backgroundColor: theme.container,
    borderRadius: 10
  },
  textName: {
    color: "#3C3A5A",
    fontFamily: "Zain-Regular",
    fontSize: 22
  },
  img: {
    width: 100,
    height: 85
  }
});

export default HelpScreen;