import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import dayjs from "dayjs";
import { RepeatSelectionModal } from "./RepeatSelectionModal";

const RepeatSelection = ({ showRepeatModal, setShowRepeatModal, date = 1, setRepetition, repeat }) => {
    const [type, setType] = useState("Once");
    const [every, setEvery] = useState("1");
    const [days, setDays] = useState([]);
    const [dayMonth, setDayMonth] = useState(dayjs(date).format("DD"));
    const [starts, setStarts] = useState(date);
    const [ends, setEnds] = useState("Never");
    const [showPicker, setShowPicker] = useState(false);
    const [showStartsPicker, setShowStartsPicker] = useState(false);
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
            setStarts(repeat.starts || date)
            setEnds(repeat.ends || "Never");
        }
    }, [showRepeatModal, repeat]); // set all data when open modal

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

    // add day to the list
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

    // don't go more than 31
    const handleMonth = (value) => {
        const newVal = value.replace(/^0+(?=\d)/, "");
        if (newVal > 31) {
            setDayMonth("31");
        } else {
            setDayMonth(newVal);
        }
    };

    const handleBlurMonth = () => {
        if (dayMonth === "" || dayMonth === "0") {
            setDayMonth("1"); // default 1
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

    const onStartsChange = (event, selectedValue) => {
        if (event.type === "set" && selectedValue) {
            setStarts(dayjs(selectedValue).format("YYYY-MM-DD"));
        } else if (event.type === "dismissed") {
            setStarts(date);
        }
        setShowStartsPicker(false);
    }

    const setAll = () => {
        if (type === "Monthly" && (dayMonth === 0 || parseInt(dayMonth) === 0)) {
            Alert.alert(
                "⚠️ Ups!",
                "Day of month cannot be 0",
                [{ text: "Try Again", style: "default" }]
            );
            setDayMonth("1");
            return;
        }

        if (type === "Monthly") {
            const month = dayjs().month() + 1;
            const year = dayjs().year();
            const newDate = `${year}-${month.toString().padStart(2, "0")}-${dayMonth.toString().padStart(2, "0")}`;
            setStarts(newDate);
        }

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
            starts,
            ends
        };

        setRepetition(repeatData);
        setShowRepeatModal(false);
    };

    // if close, and there was data already, do not change it
    const clearAll = () => {
        setType(repeat.type || "Once");
        setEvery(repeat.every?.toString() || "1");
        setDays(repeat.days || []);
        setDayMonth(repeat.dayMonth || dayjs(date).format("DD"));
        setStarts(repeat.starts || date);
        setEnds(repeat.ends || "Never");
        setShowPicker(false);
        setShowRepeatModal(false);
        if (type === "Once") {
            setIsOnDateSelected(false);
        }
    };

    return (
        <RepeatSelectionModal {...{
            type, setType, every, days, dayMonth, setDayMonth, starts, ends, setEnds, showPicker, setShowPicker,
            showStartsPicker, setShowStartsPicker, isOnDateSelected, setIsOnDateSelected, types, addDay, handleEvery, handleMonth,
            handleBlurMonth, handleRepeatBlur, onPickerChange, onStartsChange, setAll, clearAll, showRepeatModal, date
        }} />
    );
};

export default RepeatSelection;