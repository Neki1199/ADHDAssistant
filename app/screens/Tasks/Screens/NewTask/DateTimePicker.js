import React, { useContext } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { ThemeContext } from "../../../../contexts/ThemeContext";

export const DateTimePicker = ({ modalDateTime, closeDateTime, changeDateTime, calendarKey, selectedDate,
    setSelectedDate, setShowDurationPicker, time, timeSelected }) => {
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    return (
        <Modal visible={modalDateTime} transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.modalInside}>
                    <View style={styles.topModal}>
                        <TouchableOpacity onPress={() => closeDateTime()}>
                            <AntDesign name="close" size={30} color={theme.tabText} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            Date and Time
                        </Text>
                        <TouchableOpacity onPress={() => changeDateTime()}>
                            <AntDesign name="checkcircle" size={30} color={theme.tabText} />
                        </TouchableOpacity>
                    </View>
                    <Calendar
                        key={calendarKey}
                        firstDay={1}
                        markedDates={{
                            [selectedDate]: {
                                selected: true
                            }
                        }}
                        onDayPress={(day) => setSelectedDate(day.dateString)}
                        hideExtraDays={true}
                        style={{
                            width: 350,
                            height: 370,
                            borderBottomWidth: 1,
                            borderColor: "#C0C0C0"
                        }}
                        theme={{
                            calendarBackground: theme.name === "light" ? "#EBEAF6" : "#444444",
                            todayTextColor: "#847FC7",
                            textSectionTitleColor: "#B6C1CD",
                            arrowColor: theme.tabText,
                            selectedDayBackgroundColor: "#847FC7",
                            monthTextColor: theme.tabText,
                            dayTextColor: theme.text,
                            textDayFontFamily: "monospace",
                            textMonthFontFamily: "Zain-Regular",
                            textDayHeaderFontFamily: "Zain-Regular",
                            textDayFontSize: 14,
                            textMonthFontSize: 20,
                            textDayHeaderFontSize: 14
                        }}
                    />
                    <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                            onPress={() => setShowDurationPicker(true)}>
                            <Text style={[styles.modalTitle, { padding: 10, marginTop: 10 }]}>
                                {time ? time : timeSelected}
                            </Text>
                        </TouchableOpacity>
                        {timeSelected !== "Set Time" && (
                            <TouchableOpacity onPress={() => resetTime()}
                                style={styles.btn}
                            >
                                <AntDesign name="close" size={20} color={theme.tabText} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};


const useStyles = (theme) => StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    modalInside: {
        width: "100%",
        padding: 20,
        backgroundColor: theme.modalNewTask,
        alignItems: "center",
        height: 540,
        borderRadius: 30
    },
    modalTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 25,
        marginBottom: 10,
        color: theme.tabText
    },
    topModal: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        padding: 10
    },
    btn: {
        marginTop: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.primary,
        borderRadius: 30,
        width: 30,
        height: 30,
        left: 110
    }
});