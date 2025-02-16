import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import Tasks from '../screens/TasksScreen';
import Emotions from '../screens/EmotionsScreen';
import Meals from '../screens/MealsScreen';
import Focus from '../screens/FocusScreen';
import Progress from '../screens/ProgressScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Bottom tabs
function AppNavigator(){
    return(
        <Tab.Navigator initialRouteName="Tasks">
            <Tab.Screen name="Tasks" component={Tasks}/>
            <Tab.Screen name="Emotions" component={Emotions}/>
            <Tab.Screen name="Meals" component={Meals}/>
            <Tab.Screen name="Focus" component={Focus}/>
            <Tab.Screen name="Progress" component={Progress}/>
        </Tab.Navigator>
    );
}

// app stack
export default function App(){
    return(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="SignIn" component={SignInScreen} options={{headerShown: false}}/>
                <Stack.Screen name="SignUp" component={SignUpScreen} options={{title: "Sign Up"}}/>
                <Stack.Screen name="Home" component={AppNavigator} options={{headerShown: false}}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}