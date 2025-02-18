import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import Tasks from '../screens/TasksScreen';
import Emotions from '../screens/EmotionsScreen';
import Meals from '../screens/MealsScreen';
import Focus from '../screens/FocusScreen';
import Progress from '../screens/ProgressScreen';
import HomeScreen from '../screens/HomeScreen';
import Settings from '../screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App(){
    return(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="SignIn" component={SignInScreen} options={{headerShown: false}}/>
                <Stack.Screen name="SignUp" component={SignUpScreen} options={{title: "Sign Up"}}/>
                <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
                <Stack.Screen name="Tasks" component={Tasks}/>
                <Stack.Screen name="Emotions" component={Emotions}/>
                <Stack.Screen name="Meals" component={Meals}/>
                <Stack.Screen name="Focus" component={Focus}/>
                <Stack.Screen name="Progress" component={Progress}/>
                <Stack.Screen name="Settings" component={Settings}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}