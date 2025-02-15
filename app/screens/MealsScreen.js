import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Meals = () => {
  return (
    <View style={styles.container}>
      <Text>meals Screen</Text>
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

export default Meals;