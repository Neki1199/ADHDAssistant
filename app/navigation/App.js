import "react-native-reanimated";
import React, { useEffect } from 'react';
import { StatusBar, TouchableOpacity, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import Meals from '../screens/MealsScreen';
import Focus from '../screens/FocusScreen';
import Progress from '../screens/ProgressScreen';
import TopDrawer from './TopDrawer';
import HomeScreen from "../screens/HomeScreen";
import TaskTimer from "../screens/Tasks/TaskStartTimer";
import { ListsTabs } from "./TaskTabs";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import AntDesign from "react-native-vector-icons/AntDesign";
import { LinearGradient } from 'expo-linear-gradient';
import { ListsProvider } from "../contexts/ListsContext";
import * as Notifications from "expo-notifications";

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
    useEffect(() => {
        const sendTestNotification = async () => {
            await Notifications.scheduleNotificationAsync({
                content: { title: "🔔 Test Notification", body: "This is a test message!", sound: true },
                trigger: null, // Triggers immediately
            });
        };
        sendTestNotification();
    }, []);

    // to use fonts
    const [loaded, error] = useFonts({
        "Zain-Regular": require("../../assets/fonts/Zain-Regular.ttf"),
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    // permissions for notifications
    useEffect(() => {
        const getPermissions = async () => {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== "granted") {
                await Notifications.requestPermissionsAsync();
            }
        };
        getPermissions();
    }, []);

    if (!loaded && !error) {
        return null;
    };

    return (
        <>
            <StatusBar backgroundColor="#7D79C0" barStyle="light-content" />
            <ListsProvider>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: "Sign Up" }} />
                        <Stack.Screen name="Home" component={TopDrawer} options={{ headerShown: false }} />
                        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Tasks" component={ListsTabs}
                            options={({ navigation }) => ({
                                title: "My Tasks",
                                animation: "slide_from_right",
                                headerTitleAlign: "center",
                                headerStyle: {
                                    borderBottomWidth: 0,
                                    elevation: 0,
                                    shadowOpacity: 0,
                                },
                                headerBackground: () => (
                                    <LinearGradient
                                        colors={["#4B4697", "#6C66BC", "#7D79C0"]}
                                        style={{ flex: 1 }}
                                    />
                                ),
                                headerLeft: () => (
                                    <TouchableOpacity
                                        onPress={() => navigation.goBack()}
                                        style={{ paddingHorizontal: 15 }}
                                    >
                                        <AntDesign name="leftcircle" size={26} color="#FFFFFF" />
                                    </TouchableOpacity>
                                ),
                                headerRight: () => (
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate("Tasks", { openModal: true })}
                                        style={{ paddingHorizontal: 15, alignItems: "center", marginTop: 5 }}
                                    >
                                        <AntDesign name="plus" size={26} color="#FFFFFF" />
                                        <Text style={{ fontSize: 10, color: "#FFFFFF", fontFamily: "monospace" }}>Add List</Text>
                                    </TouchableOpacity>
                                ),
                                headerTitleStyle: {
                                    fontFamily: "Zain-Regular",
                                    fontSize: 24,
                                    color: "#FFFFFF",
                                },
                            })}
                        />
                        <Stack.Screen name="TaskTimer" component={TaskTimer} options={{ headerShown: false }} />
                        <Stack.Screen name="Meals" component={Meals} />
                        <Stack.Screen name="Focus" component={Focus} />
                        <Stack.Screen name="Progress" component={Progress} />
                    </Stack.Navigator>
                </NavigationContainer>
            </ListsProvider>
        </>
    );
}
