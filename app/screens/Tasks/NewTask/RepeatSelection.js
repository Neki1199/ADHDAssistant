import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";

const RepeatSelection = ({ showRepeatModal, setShowRepeatModal, date = 1, setRepetition, repeat }) => {
    const [open, setOpen] = useState(false); // open dropddown
    const [type, setType] = useState("Once");
    const [every, setEvery] = useState("1");
    const [days, setDays] = useState([]);
    const [dayMonth, setDayMonth] = useState(dayjs(date).format("DD"));
    const [ends, setEnds] = useState("Never");
    const [showPicker, setShowPicker] = useState(false);
    const [isOnDateSelected, setIsOnDateSelected] = useState(false); // if selected on date btn

    const types = [
        { label: "Once", value: "Once" },
        { label: every > 1 ? "Days" : "Day", value: "Daily" },
        { label: every > 1 ? "Weeks" : "Week", value: "Weekly" },
        { label: every > 1 ? "Months" : "Month", value: "Monthly" },
        { label: every > 1 ? "Years" : "Year", value: "Yearly" }
    ]

    useEffect(() => {
        if (showRepeatModal) {
            setType(repeat.type || "Once");
            setEvery(repeat.every?.toString() || "1");
            setDays(repeat.days || []);
            setDayMonth(repeat.dayMonth || dayjs(date).format("DD"));
            setEnds(repeat.ends || "Never");
        }
    }, [showRepeatModal, repeat, date]); // set all data when open modal

    // do not store the days if not weekly, and set never if once
    useEffect(() => {
        if (type === "Once") {
            setEnds("Never");
            setIsOnDateSelected(false);
        }
        if (type !== "Weekly") {
            setDays([]);
        }
    }, [type]);

    const addDay = (day) => {
        setDays((prev) =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    // handle 0 and other chars
    const handleEvery = (value) => {
        const newVal = value.replace(/[^0-9]/g, "");
        if (newVal === "0") {
            setEvery("1");
        } else {
            setEvery(newVal.slice(0, 2));
        }
    };

    // if the users click outside and the repeat is ""
    const handleRepeatBlur = () => {
        if (every === "") {
            setEvery("1"); // default 1
        }
    };

    const onPickerChange = (event, selectedValue) => {
        if (event.type === "set" && selectedValue) {
            setEnds(dayjs(selectedValue).format("YYYY-MM-DD"));
            setIsOnDateSelected(true);
        } else if (event.type === "dismissed") {
            setEnds("Never");
            setIsOnDateSelected(false);
        }
        setShowPicker(false);
    };

    const setAll = () => {
        // if no days selected on weekly
        if (type === "Weekly" && days.length === 0) {
            Alert.alert(
                "⚠️ Ups!",
                "Select at least one day",
                [{ text: "Try Again", style: "default" }]
            );
            return;
        }

        const repeatData = {
            type,
            every: parseInt(every) || 1,
            days,
            dayMonth,
            ends
        };

        setRepetition(repeatData);
        setShowRepeatModal(false);
    };

    // if close, and there was data already, do not change it
    const clearAll = () => {
        if (type !== "Once") {
            setType(repeat.type || "Once");
            setEvery(repeat.every?.toString() || "1");
            setDays(repeat.days || []);
            setDayMonth(repeat.dayMonth || dayjs(date).format("DD"));
            setEnds(repeat.ends || "Never");
            setShowPicker(false);
            setShowRepeatModal(false);
        } else {
            setType("Once");
            setEvery("1");
            setDays([]);
            setDayMonth(dayjs(date).format("DD"));
            setEnds("Never");
            setShowPicker(false);
            setIsOnDateSelected(false);
            setShowRepeatModal(false);
        }
    }

    return (
        <Modal visible={showRepeatModal} transparent={true} animationType="slide">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalInside}>
                        <View style={styles.topModal}>
                            <TouchableOpacity onPress={() => clearAll()
                            }>
                                <AntDesign name="close" size={30} color={"#4B4697"} />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Set Repeat</Text>
                            <TouchableOpacity onPress={() => setAll()}>
                                <AntDesign name="checkcircle" size={30} color={"#4B4697"} />
                            </TouchableOpacity>
                        </View>


                        {/* repeat type */}
                        <View style={styles.inntervalContainer}>
                            <Text style={styles.textTitle}>Every</Text>
                            <View style={styles.insideInterval}>
                                {type !== "Once" && (
                                    <TextInput
                                        style={styles.input}
                                        placeholder={every}
                                        keyboardType="numeric"
                                        maxLength={2}
                                        value={every}
                                        onBlur={handleRepeatBlur}
                                        onChangeText={handleEvery}
                                    />
                                )}
                                <View style={styles.viewDropdown}>
                                    <DropDownPicker
                                        open={open}
                                        value={type}
                                        setValue={setType}
                                        items={types}
                                        setOpen={setOpen}
                                        placeholder={"Select Interval"}
                                        itemSeparator={true}
                                        closeOnBackPressed={true}
                                        style={styles.dropdown}
                                        selectedItemContainerStyle={{ backgroundColor: "#D8D5FF" }}
                                        selectedItemLabelStyle={{ color: "#4B4697" }}
                                        dropDownContainerStyle={{ borderColor: "#C0C0C0" }}
                                        itemSeparatorStyle={{ backgroundColor: "#C0C0C0" }}
                                        textStyle={{ fontFamily: "Zain-Regular", fontSize: 20 }}
                                    />
                                </View>
                            </View>

                            {/* // if weekly selected */}
                            {type === "Weekly" && (
                                <View style={styles.weekSelect}>
                                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                        <TouchableOpacity
                                            key={day}
                                            style={[styles.days, { backgroundColor: days.includes(day) ? "#4B4697" : "#FFFFFF" }]}
                                            onPress={() => addDay(day)}
                                        >
                                            <Text style={[styles.textDay, { color: days.includes(day) ? "#FFFFFF" : "#2C2679" }]}>{day}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* if monthly is selected */}
                            {type === "Monthly" && (
                                <View style={styles.monthlySelected}>
                                    <Text style={styles.textTitle}>Day</Text>
                                    <View style={styles.monthlyInside}>
                                        <TouchableOpacity
                                            onPress={() => setDayMonth(dayjs(date).format("DD"))}
                                            style={[styles.btn, {
                                                width: dayMonth !== "Last" ? 200 : 100,
                                                height: dayMonth !== "Last" && 90,
                                                backgroundColor: dayMonth !== "Last" ? "#4B4697" : "#FFFFFF",
                                                flexDirection: "row",
                                                gap: 20
                                            }]}
                                        >
                                            <Text style={[styles.btnText, { color: dayMonth !== "Last" ? "#FFFFFF" : "#2C2679" }]}>Day</Text>
                                            {dayMonth !== "Last" && (
                                                <TextInput
                                                    // make if entered 0, put 1. No more than 31 days
                                                    style={[styles.input, { width: 60, fontSize: 20, bottom: 9 }]}
                                                    placeholder="1"
                                                    keyboardType="numeric"
                                                    maxLength={dayMonth === "Last" ? 4 : 2}
                                                    value={dayMonth}
                                                    onChangeText={setDayMonth}
                                                />
                                            )}
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => setDayMonth("Last")}
                                            style={[styles.btn, { width: 100, backgroundColor: dayMonth === "Last" ? "#4B4697" : "#FFFFFF" }]}
                                        >
                                            <Text style={[styles.btnText, { color: dayMonth === "Last" ? "#FFFFFF" : "#2C2679" }]}>Last Day</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                            )}
                        </View>

                        {/* when the repeat ends */}
                        <View style={styles.endRepeatContainer}>
                            <Text style={styles.textTitle}>End Repeat</Text>
                            <TouchableOpacity
                                disabled={type === "Once"}
                                style={[styles.btn, {
                                    backgroundColor: ends === "Never" ? "#4B4697" : "#FFFFFF",
                                    opacity: type === "Once" ? 0.5 : 1
                                }]}
                                onPress={() => {
                                    setEnds("Never");
                                    setIsOnDateSelected(false);
                                }}>
                                <Text style={[styles.btnText, { color: ends === "Never" ? "#FFFFFF" : "#4B4697" }]}>Never</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                disabled={type === "Once"}
                                style={[styles.btn, {
                                    flexDirection: "row", gap: 10,
                                    backgroundColor: ends !== "Never" ? "#4B4697" : "#FFFFFF",
                                    opacity: type === "Once" ? 0.5 : 1
                                }]}
                                onPress={() => {
                                    setIsOnDateSelected(true);
                                    setShowPicker(true)
                                }}>
                                <Text style={[styles.btnText, { color: ends !== "Never" ? "#FFFFFF" : "#4B4697" }]}>On Date</Text>
                                {ends !== "Never" &&
                                    (<Text style={[styles.btnText, { color: ends !== "Never" ? "#FFFFFF" : "#4B4697" }]}>{dayjs(ends).format("DD MMM YYYY")}</Text>)
                                }
                            </TouchableOpacity>

                            {isOnDateSelected && showPicker && (
                                <DateTimePicker
                                    value={ends === "Never" ? dayjs(date).toDate() : dayjs(ends).toDate()}
                                    mode="date"
                                    display="default"
                                    onChange={onPickerChange}
                                    design="default"
                                />
                            )}
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};


const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    modalInside: {
        width: "100%",
        height: "78%",
        alignItems: "center",
        padding: 25,
        backgroundColor: "#EBEAF6",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    modalTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 25,
        marginBottom: 10,
        color: "#4B4697"
    },
    topModal: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        padding: 10
    },
    inntervalContainer: {
        width: "100%",
    },
    insideInterval: {
        flexDirection: "row",
        height: 100,
        gap: 10,
    },
    viewDropdown: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        fontFamily: "Zain-Regular",
        textAlign: "center",
        fontSize: 24,
        width: 60,
        height: 60,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 15,
        marginTop: 20
    },
    dropdown: {
        borderWidth: 0,
        height: 60,
        width: "100%"
    },
    endRepeatContainer: {
        width: "100%",
        borderRadius: 10
    },
    textTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 22
    },
    btn: {
        marginTop: 20,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10
    },
    btnText: {
        fontFamily: "Zain-Regular",
        fontSize: 22
    },
    weekSelect: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        gap: 5
    },
    days: {
        padding: 10,
        width: 45,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10
    },
    textDay: {
        fontFamily: "monospace",
        fontSize: 12
    },
    monthlySelected: {
        marginBottom: 20
    },
    monthlyInside: {
        flexDirection: "row",
        gap: 20
    }
});

export default RepeatSelection;