import "react-native-reanimated";
import React, { useEffect } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import Progress from '../screens/ProgressScreen';
import TopDrawer from './Drawer';
import HomeScreen from "../screens/HomeScreen";
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
import { ThemeProvider } from "../contexts/ThemeContext";

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

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
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== "granted") {
                const { status, newStatus } = await Notifications.requestPermissionsAsync();
                if (newStatus !== "granted") {
                    Alert.alert("Notifications Disabled");
                }
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
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: "Sign Up" }} />
                        <Stack.Screen name="Home" component={TopDrawer} options={{ headerShown: false }} />
                        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Tasks" component={ListsTabs}
                            options={() => ({
                                title: "My Tasks",
                                animation: "slide_from_right",
                                headerTitleAlign: "center",
                                headerTitleStyle: {
                                    fontFamily: "Zain-Regular",
                                    fontSize: 24,
                                    color: "#FFFFFF",
                                },
                                headerShadowVisible: false,
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
                                        onPress={() => {
                                            setTimeout(() => {
                                                navigation.navigate("Tasks", { listID: "Daily" })
                                            }, 100);
                                        }}
                                        style={{ paddingHorizontal: 15 }}
                                    >
                                        <AntDesign name="leftcircle" size={26} color="#FFFFFF" />
                                    </TouchableOpacity>
                                ),
                                headerTitleStyle: {
                                    fontFamily: "Zain-Regular",
                                    fontSize: 30,
                                    color: "#FFFFFF",
                                },
                                headerShadowVisible: false,
                                gestureEnabled: false
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
                                        <AntDesign name="leftcircle" size={26} color="#FFFFFF" />
                                    </TouchableOpacity>
                                ),
                                headerShadowVisible: false
                            })} />
                        <Stack.Screen name="Progress" component={Progress} />
                    </Stack.Navigator>
                </NavigationContainer>
            </ListsProvider>
        </ThemeProvider>
    );
}
