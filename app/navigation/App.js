import "react-native-reanimated";
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import Meals from '../screens/MealsScreen';
import Focus from '../screens/FocusScreen';
import Progress from '../screens/ProgressScreen';
import TopDrawer from './TopDrawer';
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
    // to use fonts
    const [loaded, error] = useFonts({
        "Zain-Regular": require("../../assets/fonts/Zain-Regular.ttf"),
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    };

    return (
        <>
            <StatusBar backgroundColor="#4B4697" barStyle="light-content" />
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: "Sign Up" }} />
                    <Stack.Screen name="Home" component={TopDrawer} options={{ headerShown: false }} />
                    <Stack.Screen name="Meals" component={Meals} />
                    <Stack.Screen name="Focus" component={Focus} />
                    <Stack.Screen name="Progress" component={Progress} />
                </Stack.Navigator>
            </NavigationContainer>
        </>
    );
}
