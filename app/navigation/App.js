import "react-native-reanimated";
import React, { useContext, useEffect } from 'react';
import { TouchableOpacity, Alert, StatusBar, Text, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import Progress from '../screens/ProgressScreen';
import DrawerHome from './Drawer';
import TaskTimer from "../screens/Tasks/Screens/TaskStartTimer";
import { ListsTabs } from "./TaskTabs";
import ListTasks from "../screens/Tasks/Screens/TabLists";
import ListUpcoming from "../screens/Tasks/Screens/TabUpcoming";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import AntDesign from "react-native-vector-icons/AntDesign";
import { ListsProvider } from "../contexts/ListsContext";
import * as Notifications from "expo-notifications";
import TasksStart from "../screens/Tasks/Screens/TasksStart";
import { ThemeContext, ThemeProvider } from "../contexts/ThemeContext";
import DurationBreak from "../screens/Tasks/Components/DurationBreak";
import HelpScreen from "../screens/HelpKit/HelpScreen";

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

const StackScreens = () => {
    const { theme } = useContext(ThemeContext);

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={theme.header} />
            <Stack.Navigator screenOptions={{
                contentStyle: { backgroundColor: "transparent" }
            }} >
                <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: "Sign Up" }} />
                <Stack.Screen name="Home" component={DrawerHome} options={{ headerShown: false }} />
                <Stack.Screen name="Tasks" component={ListsTabs}
                    options={({ navigation }) => ({
                        title: "My Tasks",
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
                                onPress={() => navigation.popToTop()}
                                style={{ paddingHorizontal: 15 }}
                            >
                                <AntDesign name="leftcircle" size={28} color="#FFFFFF" />
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
                    })}
                />
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
                        title: "",
                        animation: "slide_from_right",
                        headerTitleAlign: "center",
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={() => navigation.navigate("Tasks", { listID: "Daily" })}
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
                        gestureEnabled: false,
                        headerStyle: {
                            backgroundColor: theme.header
                        }
                    })}
                />
                <Stack.Screen name="ListTasks" component={ListTasks} options={{ headerShown: false }} />
                <Stack.Screen name="ListUpcoming" component={ListUpcoming} options={{ headerShown: false }} />
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
                <Stack.Screen name="Help" component={HelpScreen} options={({ navigation }) => ({
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
                <Stack.Screen name="Progress" component={Progress} />
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
                <SafeAreaView style={{ flex: 1 }}>
                    <NavigationContainer>
                        <StackScreens />
                    </NavigationContainer>
                </SafeAreaView>
            </ListsProvider>
        </ThemeProvider>
    );
}
