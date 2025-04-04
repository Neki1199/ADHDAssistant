import React, { useContext } from 'react';
import { TouchableOpacity, Image } from 'react-native';

import AntDesign from "react-native-vector-icons/AntDesign";

import DrawerHome from './Drawer';
import { ListsTabs } from "./TaskTabs";
import HelpScreen from "../screens/HelpTools/HelpScreen";
import Disorganised from "../screens/HelpTools/Disorganised/Disorganised";
import Overwhelmed from "../screens/HelpTools/Overwhelmed/Overwhelmed";

import Unmotivated from "../screens/HelpTools/Unmotivated/Unmotivated";
import Reward from "../screens/HelpTools/Unmotivated/Reward";
import ProductiveMode from "../screens/HelpTools/Unmotivated/ProductiveMode";
import OnBed from "../screens/HelpTools/Unmotivated/OnBed";

import Stuck from "../screens/HelpTools/Stuck/Stuck";

import { ThemeContext } from "../contexts/ThemeContext";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Tab = createBottomTabNavigator();
const HelpStack = createNativeStackNavigator();

const CustomTab = ({ children, accessibilityState, onPress }) => {
    const focused = accessibilityState.selected;
    const { theme } = useContext(ThemeContext);

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
                backgroundColor: focused ? theme.name === "light" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.1)" : "transparent",
                borderTopWidth: 2,
                borderColor: focused ? theme.tabText : "transparent"
            }}>
            {children}
        </TouchableOpacity>
    )
};

const HelpStackScreens = () => {
    const { theme } = useContext(ThemeContext);

    return (
        <HelpStack.Navigator
            screenOptions={({ navigation }) => ({
                headerTitleStyle: {
                    fontFamily: "Zain-Regular",
                    fontSize: 30,
                    color: "#FFFFFF",
                },
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: theme.header
                },
                animation: "slide_from_right",
                headerTitleAlign: "center",
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ paddingHorizontal: 15 }}
                    >
                        <AntDesign name="leftcircle" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                )
            })}>
            <HelpStack.Screen name="HelpMain" component={HelpScreen} options={{ headerShown: false }} />
            <HelpStack.Screen name="Unmotivated" component={Unmotivated}
                options={{
                    title: "I Feel Unmotivated",
                }} />
            <HelpStack.Screen name="Reward" component={Reward}
                options={{
                    title: "Set a Reward",
                }} />
            <HelpStack.Screen name="Productive" component={ProductiveMode}
                options={{
                    title: "Get in Productivity Mode",
                }} />
            <HelpStack.Screen name="OnBed" component={OnBed}
                options={{
                    title: "Still on Bed",
                }} />

            <HelpStack.Screen name="Overwhelmed" component={Overwhelmed}
                options={{
                    title: "I Feel Overwhelmed",
                }} />

            <HelpStack.Screen name="Stuck" component={Stuck}
                options={{
                    title: "I Feel Stuck",
                }} />

            <HelpStack.Screen name="Disorganised" component={Disorganised}
                options={{
                    title: "I Feel Disorganized",
                }} />
        </HelpStack.Navigator>
    )
}

const BottomTabs = () => {
    const { theme } = useContext(ThemeContext);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color }) => {
                    let icon;
                    if (route.name === "Home") icon = "home";
                    else if (route.name === "Tasks") icon = "checkcircleo"
                    else if (route.name === "HelpTools") {
                        return <Image source={require("../../assets/images/help.png")}
                            style={{ width: 34, height: 34 }} />;
                    }
                    return <AntDesign name={icon} size={22} color={color} />;
                },
                headerShown: false,
                swipeEnabled: false,
                animationEnabled: false,
                tabBarActiveTintColor: theme.textTabTasks,
                tabBarInactiveTintColor: theme.textTabTasks,
                tabBarActiveBackgroundColor: theme.linear3,
                tabBarStyle: {
                    backgroundColor: theme.linear2,
                    borderColor: "transparent",
                    height: 70,
                    elevation: 0,
                    shadowOpacity: 0
                },
                tabBarLabelStyle: {
                    fontFamily: "Zain-Regular",
                    fontSize: 14
                }
            })}
        >
            <Tab.Screen name="Home" component={DrawerHome}
                options={{
                    tabBarButton: (props) => <CustomTab {...props} />
                }}
            />
            <Tab.Screen name="Tasks" component={ListsTabs}
                initialParams={{ listID: "Daily" }}
                options={{
                    headerShown: false,
                    title: "My Tasks",
                    tabBarButton: (props) => <CustomTab {...props} />
                }}
            />
            <Tab.Screen name="HelpTools" component={HelpStackScreens}
                options={{
                    title: "Help Tools",
                    headerShown: false,
                    tabBarButton: (props) => <CustomTab {...props} />
                }} />
        </Tab.Navigator>
    );
};

export default BottomTabs;