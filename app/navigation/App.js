import "react-native-reanimated";
import React, { useContext, useEffect } from 'react';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { TouchableOpacity, Alert, StatusBar, SafeAreaView } from 'react-native';
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import AntDesign from "react-native-vector-icons/AntDesign";

import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import DrawerHome from './Drawer';
import { ListsTabs } from "./TaskTabs";
import TasksStart from "../screens/Tasks/Screens/TasksStart";
import TaskTimer from "../screens/Tasks/Screens/TaskStartTimer";
import DurationBreak from "../screens/Tasks/Screens/DurationBreak";
import HelpScreen from "../screens/HelpTools/HelpScreen";
import Disorganized from "../screens/HelpTools/Screens/Disorganized";
import Overwhelmed from "../screens/HelpTools/Screens/Overwhelmed";
import Unmotivated from "../screens/HelpTools/Screens/Unmotivated";
import Stuck from "../screens/HelpTools/Screens/Stuck";

import { ListsProvider } from "../contexts/ListsContext";
import { ThemeContext, ThemeProvider } from "../contexts/ThemeContext";
import BottomTabs from "./BottomTabs";


SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

const StackScreens = () => {
    const { theme } = useContext(ThemeContext);

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={theme.header} />
            <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: "transparent" } }}
            >
                <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SignUp" component={SignUpScreen}
                    options={({ navigation }) => ({
                        title: "Sign Up",
                        animation: "slide_from_right",
                        headerTitleAlign: "center",
                        headerTitleStyle: {
                            fontFamily: "Zain-Regular",
                            fontSize: 24,
                            color: "#FFFFFF",
                        },
                        headerShadowVisible: false,
                        headerStyle: {
                            backgroundColor: theme.header
                        },
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{ paddingHorizontal: 15 }}
                            >
                                <AntDesign name="leftcircle" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        )
                    })} />
                <Stack.Screen name="Tabs" component={BottomTabs} options={{ headerShown: false }} />
                <Stack.Screen name="Home" component={DrawerHome} options={{ headerShown: false }} />
                <Stack.Screen name="TaskTimer" component={TaskTimer}
                    options={({ navigation }) =>
                    ({
                        title: "Task Timer",
                        animation: "slide_from_right",
                        headerTitleAlign: "center",
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{ paddingHorizontal: 15 }}
                            >
                                <AntDesign name="leftcircle" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        ),
                        headerTitleStyle: {
                            fontFamily: "Zain-Regular",
                            fontSize: 30,
                            color: "#FFFFFF",
                        },
                        headerStyle: {
                            backgroundColor: theme.header
                        },
                        headerShadowVisible: false,
                        gestureEnabled: false
                    })}
                />
                <Stack.Screen name="DurationBreak" component={DurationBreak}
                    options={({ navigation }) =>
                    ({
                        title: "Duration and Break",
                        animation: "slide_from_right",
                        headerTitleAlign: "center",
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{ paddingHorizontal: 15 }}
                            >
                                <AntDesign name="leftcircle" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        ),
                        headerRight: () => (
                            <TouchableOpacity
                                onPress={() => navigation.navigate("Tabs", { screen: "Tasks" })}
                                style={{
                                    width: 30, height: 30, backgroundColor: "#FFFFFF", borderRadius: 20,
                                    alignItems: "center", justifyContent: "center", right: 15
                                }}
                            >
                                <AntDesign name="home" size={20} color={theme.header} />
                            </TouchableOpacity>
                        ),
                        headerTitleStyle: {
                            fontFamily: "Zain-Regular",
                            fontSize: 30,
                            color: "#FFFFFF",
                        },
                        headerShadowVisible: false,
                        gestureEnabled: false,
                        headerStyle: {
                            backgroundColor: theme.header
                        }
                    })}
                />
                <Stack.Screen name="TasksStart" component={TasksStart}
                    options={({ navigation }) => ({
                        title: "",
                        animation: "slide_from_right",
                        headerTitleAlign: "center",
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{ paddingHorizontal: 15 }}
                            >
                                <AntDesign name="leftcircle" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        ),
                        headerShadowVisible: false,
                        headerStyle: {
                            backgroundColor: theme.header
                        }
                    })} />
                <Stack.Screen name="Help" component={HelpScreen}
                    options={({ navigation }) => ({
                        title: "Tasks Help",
                        animation: "slide_from_right",
                        headerTitleAlign: "center",
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{ paddingHorizontal: 15 }}
                            >
                                <AntDesign name="leftcircle" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        ),
                        headerTitleStyle: {
                            fontFamily: "Zain-Regular",
                            fontSize: 30,
                            color: "#FFFFFF",
                        },
                        headerShadowVisible: false,
                        headerStyle: {
                            backgroundColor: theme.header
                        }
                    })} />
                <Stack.Screen name="Disorganized" component={Disorganized}
                    options={({ navigation }) => ({
                        title: "I Feel Disorganized",
                        animation: "slide_from_right",
                        headerTitleAlign: "center",
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{ paddingHorizontal: 15 }}
                            >
                                <AntDesign name="leftcircle" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        ),
                        headerTitleStyle: {
                            fontFamily: "Zain-Regular",
                            fontSize: 30,
                            color: "#FFFFFF",
                        },
                        headerShadowVisible: false,
                        headerStyle: {
                            backgroundColor: theme.header
                        }
                    })} />
                <Stack.Screen name="Overwhelmed" component={Overwhelmed}
                    options={({ navigation }) => ({
                        title: "I Feel Overwhelmed",
                        animation: "slide_from_right",
                        headerTitleAlign: "center",
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{ paddingHorizontal: 15 }}
                            >
                                <AntDesign name="leftcircle" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        ),
                        headerTitleStyle: {
                            fontFamily: "Zain-Regular",
                            fontSize: 30,
                            color: "#FFFFFF",
                        },
                        headerShadowVisible: false,
                        headerStyle: {
                            backgroundColor: theme.header
                        }
                    })} />
                <Stack.Screen name="Stuck" component={Stuck}
                    options={({ navigation }) => ({
                        title: "I Feel Stuck",
                        animation: "slide_from_right",
                        headerTitleAlign: "center",
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{ paddingHorizontal: 15 }}
                            >
                                <AntDesign name="leftcircle" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        ),
                        headerTitleStyle: {
                            fontFamily: "Zain-Regular",
                            fontSize: 30,
                            color: "#FFFFFF",
                        },
                        headerShadowVisible: false,
                        headerStyle: {
                            backgroundColor: theme.header
                        }
                    })} />
                <Stack.Screen name="Unmotivated" component={Unmotivated}
                    options={({ navigation }) => ({
                        title: "I Feel Unmotivated",
                        animation: "slide_from_right",
                        headerTitleAlign: "center",
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{ paddingHorizontal: 15 }}
                            >
                                <AntDesign name="leftcircle" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        ),
                        headerTitleStyle: {
                            fontFamily: "Zain-Regular",
                            fontSize: 30,
                            color: "#FFFFFF",
                        },
                        headerShadowVisible: false,
                        headerStyle: {
                            backgroundColor: theme.header
                        }
                    })} />
            </Stack.Navigator>
        </>
    );
}

export default function App() {

    // to use fonts
    const [loaded, error] = useFonts({
        "Zain-Regular": require("../../assets/fonts/Zain-Regular.ttf"),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        } else if (error) {
            console.log("Font loading error: ", error);
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    // permissions for notifications
    useEffect(() => {
        const getPermissions = async () => {
            const { status: currentStatus } = await Notifications.getPermissionsAsync();
            let nowStatus = currentStatus;
            if (nowStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                nowStatus = status;
            }
            if (nowStatus !== "granted") {
                Alert.alert("Notifications Disabled");
            }
        };
        getPermissions();
    }, []);

    if (!loaded) {
        return null;  // until fonts are ready
    };

    return (
        <ThemeProvider>
            <ListsProvider>
                <GestureHandlerRootView>
                    <SafeAreaView style={{ flex: 1 }}>
                        <NavigationContainer>
                            <StackScreens />
                        </NavigationContainer>
                    </SafeAreaView>
                </GestureHandlerRootView>
            </ListsProvider>
        </ThemeProvider>
    );
}
