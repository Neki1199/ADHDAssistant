import React, { useContext, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../contexts/ThemeContext';

export default function Settings({ navigation }) {
  const { theme } = useContext(ThemeContext);

  return (
    <LinearGradient
      colors={[theme.header, theme.linear2]}
      style={styles.gradient}
    >

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  }
});