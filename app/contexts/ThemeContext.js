import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const lightTheme = {
    name: "light",
    header: "#7D79C0",
    container: "#FFFFFF",
    input: "#F0F0F0",
    text: "#000000",
    primary: "#4B4697",
    linear2: "#EBEAF6",
    linear3: "#6C66BC",
    // progress tabs
    tab: "#FFFFFF",
    activetab: "#0F0A51",
    tabText: "#4B4697",
    // emotions progress
    textDate: "#0F0A51",
    // drawer
    drawerActive: "#6D67BD",
    // change list
    delete: "#9B1515",
    // tasks tabs
    textTabTasks: "#000000",
    itemNewText: "#FFFFFF",
    itemNew: "#FFFFFF",
    listText: "#626262",
    itemModal: "#FFFFFF",
    modalNewTask: "#EBEAF6",
    // random tasks
    title: "#1D1869",
    textTimer: "#606060",
    textTime: "#4B4697",
    textBreak: "#000000",

};

export const darkTheme = {
    name: "dark",
    header: "#1C1C1C",
    container: "#444444",
    input: "#808080",
    text: "#FFFFFF",
    primary: "#1C1C1C",
    linear2: "#3C3A5A",
    linear3: "#24214A",
    //progress tabs
    tab: "#808080",
    activetab: "#000000",
    tabText: "#FFFFFF",
    // emotions progress
    textDate: "#FFFFFF",
    //drawer
    drawerActive: "#24214A",
    // change list
    delete: "#201E3F",
    // tasks tabs
    textTabTasks: "#C0C0C0",
    itemNewText: "#24214A",
    itemNew: "#12102F",
    listText: "#E0E0E0",
    itemModal: "#7C7A97",
    modalNewTask: "#444444",
    // random tasks
    title: "#FFFFFF",
    textTimer: "#A2A0BA",
    textTime: "#A8A2FF",
    textBreak: "#938BFF",
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    // get theme when app initiate
    useEffect(() => {
        const setTheme = async () => {
            try {
                const themeSaved = await AsyncStorage.getItem("theme");
                if (themeSaved) {
                    setIsDark(themeSaved === "dark");
                }
            } catch (error) {
                console.log("Could not load theme from async: ", error);
            }
        };
        setTheme();
    }, []);

    const changeTheme = async () => {
        const newTheme = !isDark ? "dark" : "light"; // for storage
        setIsDark(!isDark);
        try {
            await AsyncStorage.setItem("theme", newTheme);
        } catch (error) {
            console.log("Could not save theme on async: ", error);
        }
    };

    // get the theme values
    const theme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, changeTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};