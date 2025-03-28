import React, { useContext } from "react";
import { TimerPickerModal } from "react-native-timer-picker";
import { ThemeContext } from "../../../../contexts/ThemeContext";

export const DurationPicker = ({ pickerField, setPickerField, setTimeSelected, initialTime, showDurationPicker, setShowDurationPicker,
    updateTaskDetails }) => {
    const { theme } = useContext(ThemeContext);

    const setDuration = (newValue) => {
        updateTaskDetails("Duration", newValue)
    };

    return (
        <TimerPickerModal
            visible={showDurationPicker}
            setIsVisible={setShowDurationPicker}
            initialValue={pickerField === "Time" ? initialTime : {
                hours: 0,
                minutes: 0
            }}
            onConfirm={(durationSelected) => {
                const hh = durationSelected.hours.toString().padStart(2, "0");
                const mm = durationSelected.minutes.toString().padStart(2, "0");
                if (pickerField === "Duration") {
                    // make time 00:00 format
                    setDuration(`${hh}:${mm}`);
                    setShowDurationPicker(false);
                    setPickerField("");
                } else if (pickerField === "Reminder") {
                    updateTaskDetails("Reminder", `${hh}:${mm}`);
                    setShowDurationPicker(false);
                    setPickerField("");
                } else if (pickerField === "Time") {
                    setTimeSelected(`${hh}:${mm}`);
                    setShowDurationPicker(false);
                }
            }}
            modalTitle={pickerField === "Duration" ? "Set Duration" :
                pickerField === "Time" ? "Set Time" : "Set Reminder"}
            onCancel={() => setShowDurationPicker(false)}
            closeOnOverlayPress
            hideSeconds
            hourLimit={pickerField === "Duration" && { max: 2, min: 0 }}
            styles={{
                theme: theme.name === "light" ? "light" : "dark",
                pickerItem: {
                    fontFamily: "monospace"
                },
                pickerLabel: {
                    color: "#4B4697",
                },
                modalTitle: {
                    fontFamily: "Zain-Regular",
                    fontSize: 26
                },
                cancelButton: {
                    color: theme.name === "light" ? "#4B4697" : "#FFFFFF",
                    borderColor: theme.name === "light" ? "#4B4697" : "transparent"
                },
                confirmButton: {
                    backgroundColor: "#4B4697",
                    color: "#FFFFFF",
                    borderWidth: 0
                }
            }}
            modalProps={{
                overlayOpacity: 0.2
            }}
        />
    );
};