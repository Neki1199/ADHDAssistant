import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Settings({ navigation }) {
  
  return (
    <View style={styles.container}>
      <Text>settings</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});